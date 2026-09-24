export function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const lowered = message.toLowerCase();

  if (lowered.includes('supabase não configurado') || lowered.includes('not configured')) {
    return 'Autenticação real ainda não está configurada neste ambiente.';
  }
  if (lowered.includes('invalid login') || lowered.includes('invalid credentials')) {
    return 'E-mail ou senha inválidos.';
  }
  if (lowered.includes('email not confirmed')) {
    return 'Confirme seu e-mail para continuar.';
  }
  if (lowered.includes('user already registered')) {
    return 'Este e-mail já possui cadastro.';
  }
  if (lowered.includes('password')) {
    return 'A senha não atende aos requisitos mínimos.';
  }
  if (lowered.includes('not_authorized') || lowered.includes('42501')) {
    return 'Você não tem permissão para esta ação.';
  }
  return message || 'Não foi possível concluir a autenticação.';
}
