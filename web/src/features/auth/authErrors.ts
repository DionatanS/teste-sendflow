import { FirebaseError } from 'firebase/app'

const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
}

export function describeAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? 'Não foi possível completar a ação. Tente novamente.'
  }
  return 'Não foi possível completar a ação. Tente novamente.'
}
