import { app } from "electron";
import { LoggerMain } from "./LoggerMain";

/**
 * The Translator class is used to translate text into different languages.
 */
export class TranslatorRenderer {

    /**
     * Private constructor to prevent instantiation
     */
    private constructor() {
    }

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
    public static initialize(translations: Record<string, Record<string, string>>) {
        TranslatorRenderer.curLang = app.getLocale();
        LoggerMain.info("Initializing translator. Current language " + TranslatorRenderer.curLang);
        TranslatorRenderer.dictionary = translations;
    }

    /**
     * Method to translate a given text into the current language.
     * @param key - The text to translate
     * @param replacements - An object that contains key-value pairs to replace in the text
     * @returns The translated text. If a translation for a text is not found in the current dictionary, the original text is returned.
     */
    public static translate(key: string, replacements: Record<string, any> = {}) {
        let result: string = key;

        if (TranslatorRenderer.dictionary[key] !== null && TranslatorRenderer.dictionary[key] !== undefined) {
            const keyEntry = TranslatorRenderer.dictionary[key];
            if (keyEntry[TranslatorRenderer.curLang] !== null && keyEntry[TranslatorRenderer.curLang] !== undefined) {
                result = keyEntry[TranslatorRenderer.curLang];
            } else {
                if (keyEntry[TranslatorRenderer.defLang] !== null && keyEntry[TranslatorRenderer.defLang] !== undefined) {
                    result = keyEntry[TranslatorRenderer.defLang];
                }
            }
            for (const key in replacements) {
                const placeholder = `{{${key}}}`;
                result = result.split(placeholder).join(replacements[key])
            }
        }

        return result;
    }
}