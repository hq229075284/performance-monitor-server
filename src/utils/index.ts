export function formatResponseMessage(message: string, status: number = 0) {
  return {
    message,
    status,
  };
}
