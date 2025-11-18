## Publicando no VPS da Hostinger (`/var/www/angular-app`)

O projeto já está configurado para apontar o ambiente de produção para `https://becarini.com.br/api` (arquivo `src/environments/environment.production.ts`). Siga os passos abaixo no seu VPS para gerar o bundle estático do Angular e servi-lo via Nginx (ou outro servidor web).

### 1. Pré-requisitos (executar uma vez)

1. Atualize o servidor e instale as ferramentas necessárias:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y curl git rsync nginx
   ```
2. Instale o Node.js 20 LTS (exemplo usando nvm):
   ```bash
   curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.nvm/nvm.sh
   nvm install 20
   ```
3. (Opcional) Instale o `pnpm` caso prefira usá-lo no lugar do npm:
   ```bash
   corepack enable pnpm
   ```
4. Clone ou atualize este repositório em um diretório como `/opt/imobiliaria-frontend`.

### 2. Script de build e deploy

Existe um script auxiliar em `scripts/deploy.sh`. Ele instala as dependências, executa o build de produção do Angular e sincroniza os arquivos gerados com `/var/www/angular-app`.

Uso a partir da raiz do projeto no VPS:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

O script usa `pnpm install --frozen-lockfile` quando o pnpm está disponível; caso contrário, utiliza npm. Após o build, o conteúdo de `dist/imobiliaria-frontend/browser` é sincronizado (com remoção de arquivos obsoletos) para `/var/www/angular-app` usando `rsync`.

### 3. Configuração do Nginx

Configure o Nginx para servir os arquivos estáticos e garantir que todas as rotas da SPA retornem `index.html`:

```nginx
server {
    listen 80;
    server_name becarini.com.br www.becarini.com.br;

    root /var/www/angular-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # A API vive no mesmo domínio em /api, então apenas repassamos.
    location /api/ {
        proxy_pass https://becarini.com.br/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Habilite o site:

```bash
sudo ln -s /etc/nginx/sites-available/angular-app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Se a API já estiver exposta em `https://becarini.com.br/api`, você pode remover o bloco `/api` acima e deixar as requisições seguirem diretamente para o host da API.

### 4. Publicações futuras

Para cada nova versão:

1. Atualize o código no VPS: `git pull origin main`.
2. Execute `./scripts/deploy.sh`.
3. (Opcional) Limpe caches de navegador ou invalide o CDN, caso exista.

Com isso você gera e publica novos bundles Angular em `/var/www/angular-app`, consumindo a API de produção.
