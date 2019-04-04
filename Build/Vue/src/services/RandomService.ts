export default class RandomService {
  public static getRandomString(length: number = 7): string {
    return Math.random().toString(36).substring(length);
  }
}
