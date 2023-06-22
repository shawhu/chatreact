import GPT3Tokenizer from "gpt3-tokenizer";

var pattern =
  /[a-zA-Z0-9_\u0392-\u03c9\u00c0-\u00ff\u0600-\u06ff\u0400-\u04ff]+|[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3040-\u309f\uac00-\ud7af]+/g;
export function countWord(data: string): number {
  var m = data.match(pattern);
  var count = 0;
  if (!m) {
    return 0;
  }
  for (var i = 0; i < m.length; i++) {
    if (m[i].charCodeAt(0) >= 0x4e00) {
      count += m[i].length;
    } else {
      count += 1;
    }
  }
  return count;
}

const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
export function estimateTokens(str: string): number {
  const encoded: { bpe: number[]; text: string[] } = tokenizer.encode(str);
  return encoded.bpe.length;
}

export function getFormattedDateTime(unixTime?: number) {
  if (!unixTime) {
    return "";
  }

  const date = new Date(unixTime * 1000);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    const timeString = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return timeString;
  } else if (date.toDateString() === new Date(now.setDate(now.getDate() - 1)).toDateString()) {
    const timeString = `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return `Yesterday ${timeString}`;
  } else {
    const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
      .getDate()
      .toString()
      .padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    return dateString;
  }
}

export function GetStandarizedModelName(fullname: string) {
  const lowcase = fullname.toLowerCase();
  let normalName = lowcase.replaceAll("4bit", "");
  normalName = normalName.replaceAll("128g", "");
  normalName = normalName.replaceAll("gptq", "");
  normalName = normalName.replaceAll("-", "");
  if (lowcase.includes("4bit") || lowcase.includes("gptq") || lowcase.includes("128g")) {
    return `${normalName}-gptq`;
  } else {
    return `${normalName}`;
  }
}
export function TrimAndGetTextInQuote(text: string) {
  const pattern = /^\s*["']?([^"']*)["']?\s*$/g;
  const trimmedText = text.trim(); // trim the text
  const matchedText = pattern.exec(trimmedText); // check if text is enclosed in double quote using regex
  if (matchedText) {
    return matchedText[1]; // return the text enclosed in double quotes
  } else {
    return trimmedText; // return the trimmed text
  }
}
