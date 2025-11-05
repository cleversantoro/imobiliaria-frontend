import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { NextFunction, Request, Response } from 'express';
import multer, { MulterError } from 'multer';
import { mkdirSync } from 'node:fs';
import { readdir, unlink } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const uploadRoot = resolve(process.cwd(), 'uploads');
const MAX_IMAGES_PER_PROPERTY = 10;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
]);

const app = express();
const angularApp = new AngularNodeAppEngine();

mkdirSync(uploadRoot, { recursive: true });

const sanitizeIdentifier = (value: string | undefined): string => {
  if (!value) {
    return '';
  }

  return value.replace(/[^a-zA-Z0-9_-]/g, '');
};

const getPropertyUploadDir = (propertyId: string): string =>
  join(uploadRoot, 'imoveis', propertyId);

const storage = multer.diskStorage({
  destination: (req, _file, callback) => {
    const propertyId = sanitizeIdentifier(req.params?.['id']);

    if (!propertyId) {
      callback(new Error('Identificador do imovel invalido.'), '');
      return;
    }

    const propertyDir = getPropertyUploadDir(propertyId);
    mkdirSync(propertyDir, { recursive: true });
    callback(null, propertyDir);
  },
  filename: (_req, file, callback) => {
    const extension = extname(file.originalname) || '.jpg';
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 8);
    callback(null, `${timestamp}-${randomPart}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: MAX_IMAGES_PER_PROPERTY,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error('Formato de arquivo nao suportado.'));
      return;
    }

    callback(null, true);
  },
});

const ensurePropertyCapacity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const propertyId = sanitizeIdentifier(req.params?.['id']);

    if (!propertyId) {
      res.status(400).json({ message: 'Identificador do imovel invalido.' });
      return;
    }

    try {
      const existingFiles = await readdir(getPropertyUploadDir(propertyId));
      if (existingFiles.length >= MAX_IMAGES_PER_PROPERTY) {
        res
          .status(400)
          .json({
            message: `Cada imovel pode conter no maximo ${MAX_IMAGES_PER_PROPERTY} fotos.`,
          });
        return;
      }
    } catch {
      // Diretorio ainda nao existe, entao nao ha arquivos.
    }

    next();
  } catch (error) {
    next(error);
  }
};

app.post(
  '/api/imoveis/:id/fotos',
  ensurePropertyCapacity,
  (req: Request, res: Response, next: NextFunction) => {
    upload.array('fotos', MAX_IMAGES_PER_PROPERTY)(req, res, async (error) => {
      if (error) {
        if (error instanceof MulterError) {
          const message =
            error.code === 'LIMIT_FILE_COUNT'
              ? `Envie no maximo ${MAX_IMAGES_PER_PROPERTY} arquivos por requisicao.`
              : error.message;
          res.status(400).json({ message });
          return;
        }

        res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
        return;
      }

      const uploadedFiles = (req.files as Express.Multer.File[]) ?? [];

      if (!uploadedFiles.length) {
        res.status(400).json({ message: 'Nenhuma imagem foi enviada.' });
        return;
      }

      const propertyId = sanitizeIdentifier(req.params['id']);
      if (!propertyId) {
        res.status(400).json({ message: 'Identificador do imovel invalido.' });
        return;
      }

      try {
        const propertyDir = getPropertyUploadDir(propertyId);
        const currentFiles = await readdir(propertyDir);

        if (currentFiles.length > MAX_IMAGES_PER_PROPERTY) {
          await Promise.all(
            uploadedFiles.map((file) =>
              unlink(file.path).catch(() => {
                // Ignora falhas ao remover arquivos recem enviados.
              }),
            ),
          );

          res
            .status(400)
            .json({
              message: `Cada imovel pode conter no maximo ${MAX_IMAGES_PER_PROPERTY} fotos.`,
            });
          return;
        }

        const fotos = uploadedFiles.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: join('/uploads', 'imoveis', propertyId, file.filename).replace(/\\/g, '/'),
        }));

        res.status(201).json({ fotos });
      } catch (err) {
        next(err);
      }
    });
  },
);

app.get('/api/imoveis/:id/fotos', async (req: Request, res: Response) => {
  const propertyId = sanitizeIdentifier(req.params?.['id']);

  if (!propertyId) {
    res.status(400).json({ message: 'Identificador do imovel invalido.' });
    return;
  }

  try {
    const propertyDir = getPropertyUploadDir(propertyId);
    const files = await readdir(propertyDir);

    const fotos = files.map((fileName) => ({
      filename: fileName,
      url: join('/uploads', 'imoveis', propertyId, fileName).replace(/\\/g, '/'),
    }));

    res.json({ fotos });
  } catch {
    res.json({ fotos: [] });
  }
});

/**
 * Serve uploaded files statically.
 */
app.use(
  '/uploads',
  express.static(uploadRoot, {
    index: false,
    maxAge: '1d',
  }),
);

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
