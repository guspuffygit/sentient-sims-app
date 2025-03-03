import { appApiUrl } from 'main/sentient-sims/constants';

type PhonemizeResult = {
  text: string;
};

type LanguageType = 'a' | 'b';

export async function phonemize(text: string, language: LanguageType) {
  const encodedText = encodeURIComponent(text);
  const response = await fetch(
    `${appApiUrl}/phonemize?text=${encodedText}&language=${language}`
  );
  const result: PhonemizeResult = await response.json();
  return result.text;
}
