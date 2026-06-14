/*
 * 字符串 相关操作
 *
 */

/**
 * 转为 小写中划线
 */
export function convertLowerHyphen(str) {
  if (!str) {
    return "";
  }

  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}
/**
 * 转为驼峰
 */
export function convertUpperCamel(str) {
  if (!str) {
    return "";
  }

  str = str.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
  // 首字母大写
  return str[0].toUpperCase() + str.substring(1);
}

/**
 * 转为驼峰
 */
export function convertLowerCamel(str) {
  if (!str) {
    return "";
  }

  return str.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
}

/**
 * JSON格式化
 */
export function jsonFormat(srcStr, dataType) {
  try {
    let formatStr = srcStr.trim();
    let jsonObj = JSON.parse(formatStr);
    if (dataType === "str") {
      let jsonStr = JSON.stringify(jsonObj, null, 2);
      return jsonStr;
    }
    return jsonObj;
  } catch (e) {
    throw new Error("JSON格式化失败，请检查srcStr字符串是否正确！");
  }
}

/**
 * 去除转义字符
 */
export function remEscap(inputStr) {
  if (typeof inputStr !== "string") {
    throw new Error("输入必须是字符串");
  }
  // 使用正则表达式去除转义字符和换行符，并将其转换为实际字符
  return inputStr
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
}
