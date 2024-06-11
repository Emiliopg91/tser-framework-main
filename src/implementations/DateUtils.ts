export class DateUtils {
  public static dateToFormattedString(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const sss = String(date.getMilliseconds()).padEnd(3, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${MM}:${ss}.${sss}`;
  }
}
