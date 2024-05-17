/**
 * The Translator class is used to translate text into different languages.
 */
export class TranslatorMain {
  /**
   * Private constructor to prevent instantiation
   */
  private constructor() {}

  /**
   * The dictionary
   */
  private static dictionary: Record<string, Record<string, string>> = {};

  /**
   * Default language
   */
  private static defLang: string = "en";

  /**
   * Current language
   */
  private static curLang: string = "en";

  /**
   * Method to set up the translator. It retrieves the current language from the SteamClient.Settings,
   * logs the language, and sets the currDictionary to the dictionary of the current language.
   * If the current language is not English and no translation is available, it falls back to English.
   */
  public static initialize(
    translations: Record<string, Record<string, string>>
  ) {
    TranslatorMain.curLang = Intl.DateTimeFormat()
      .resolvedOptions()
      .locale.substring(0, 2);
    TranslatorMain.dictionary = translations;
  }

  /**
   * Method to translate a given text into the current language.
   * @param key - The text to translate
   * @param replacements - An object that contains key-value pairs to replace in the text
   * @returns The translated text. If a translation for a text is not found in the current dictionary, the original text is returned.
   */
  public static translate(key: string, replacements: Record<string, any> = {}) {
    let result: string = key;

    if (
      TranslatorMain.dictionary[key] !== null &&
      TranslatorMain.dictionary[key] !== undefined
    ) {
      const keyEntry = TranslatorMain.dictionary[key];
      if (
        keyEntry[TranslatorMain.curLang] !== null &&
        keyEntry[TranslatorMain.curLang] !== undefined
      ) {
        result = keyEntry[TranslatorMain.curLang];
      } else {
        if (
          keyEntry[TranslatorMain.defLang] !== null &&
          keyEntry[TranslatorMain.defLang] !== undefined
        ) {
          result = keyEntry[TranslatorMain.defLang];
        }
      }
      for (const key in replacements) {
        const placeholder = `{{${key}}}`;
        result = result.split(placeholder).join(replacements[key]);
      }
    }

    return result;
  }
}
