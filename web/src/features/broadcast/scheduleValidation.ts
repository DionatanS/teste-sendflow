export type ScheduleValidationResult =
  | { ok: true; scheduledFor: Date }
  | { ok: false; error: string }

export function validateScheduledDate(
  datetimeLocalValue: string,
  now: Date = new Date(),
): ScheduleValidationResult {
  const scheduledFor = new Date(datetimeLocalValue)
  if (Number.isNaN(scheduledFor.getTime())) {
    return { ok: false, error: 'Escolha uma data e hora futuras para o agendamento.' }
  }
  if (scheduledFor.getTime() <= now.getTime()) {
    return { ok: false, error: 'Escolha uma data e hora futuras para o agendamento.' }
  }
  return { ok: true, scheduledFor }
}
