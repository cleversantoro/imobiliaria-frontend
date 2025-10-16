import { HttpErrorResponse, HttpParams } from '@angular/common/http';

export function buildHttpParams(params: Record<string, unknown> = {}): HttpParams {
  return Object.entries(params).reduce((httpParams, [key, value]) => {
    if (value === null || value === undefined || value === '') {
      return httpParams;
    }

    if (Array.isArray(value)) {
      return value.reduce((acc, current) => acc.append(key, String(current)), httpParams);
    }

    return httpParams.set(key, String(value));
  }, new HttpParams());
}

export function extractHttpErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const apiMessage =
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || error.message || 'Erro inesperado ao comunicar com o servidor.';
    return apiMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}
