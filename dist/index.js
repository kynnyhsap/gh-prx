#!/usr/bin/env node
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS((exports, module) => {
  var p = process || {};
  var argv = p.argv || [];
  var env = p.env || {};
  var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
  var formatter = (open, close, replace = open) => (input) => {
    let string = "" + input, index = string.indexOf(close, open.length);
    return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
  };
  var replaceClose = (string, close, replace, index) => {
    let result = "", cursor = 0;
    do {
      result += string.substring(cursor, index) + replace;
      cursor = index + close.length;
      index = string.indexOf(close, cursor);
    } while (~index);
    return result + string.substring(cursor);
  };
  var createColors = (enabled = isColorSupported) => {
    let f = enabled ? formatter : () => String;
    return {
      isColorSupported: enabled,
      reset: f("\x1B[0m", "\x1B[0m"),
      bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
      dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
      italic: f("\x1B[3m", "\x1B[23m"),
      underline: f("\x1B[4m", "\x1B[24m"),
      inverse: f("\x1B[7m", "\x1B[27m"),
      hidden: f("\x1B[8m", "\x1B[28m"),
      strikethrough: f("\x1B[9m", "\x1B[29m"),
      black: f("\x1B[30m", "\x1B[39m"),
      red: f("\x1B[31m", "\x1B[39m"),
      green: f("\x1B[32m", "\x1B[39m"),
      yellow: f("\x1B[33m", "\x1B[39m"),
      blue: f("\x1B[34m", "\x1B[39m"),
      magenta: f("\x1B[35m", "\x1B[39m"),
      cyan: f("\x1B[36m", "\x1B[39m"),
      white: f("\x1B[37m", "\x1B[39m"),
      gray: f("\x1B[90m", "\x1B[39m"),
      bgBlack: f("\x1B[40m", "\x1B[49m"),
      bgRed: f("\x1B[41m", "\x1B[49m"),
      bgGreen: f("\x1B[42m", "\x1B[49m"),
      bgYellow: f("\x1B[43m", "\x1B[49m"),
      bgBlue: f("\x1B[44m", "\x1B[49m"),
      bgMagenta: f("\x1B[45m", "\x1B[49m"),
      bgCyan: f("\x1B[46m", "\x1B[49m"),
      bgWhite: f("\x1B[47m", "\x1B[49m"),
      blackBright: f("\x1B[90m", "\x1B[39m"),
      redBright: f("\x1B[91m", "\x1B[39m"),
      greenBright: f("\x1B[92m", "\x1B[39m"),
      yellowBright: f("\x1B[93m", "\x1B[39m"),
      blueBright: f("\x1B[94m", "\x1B[39m"),
      magentaBright: f("\x1B[95m", "\x1B[39m"),
      cyanBright: f("\x1B[96m", "\x1B[39m"),
      whiteBright: f("\x1B[97m", "\x1B[39m"),
      bgBlackBright: f("\x1B[100m", "\x1B[49m"),
      bgRedBright: f("\x1B[101m", "\x1B[49m"),
      bgGreenBright: f("\x1B[102m", "\x1B[49m"),
      bgYellowBright: f("\x1B[103m", "\x1B[49m"),
      bgBlueBright: f("\x1B[104m", "\x1B[49m"),
      bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
      bgCyanBright: f("\x1B[106m", "\x1B[49m"),
      bgWhiteBright: f("\x1B[107m", "\x1B[49m")
    };
  };
  module.exports = createColors();
  module.exports.createColors = createColors;
});

// node_modules/goke/dist/goke.js
var import_picocolors = __toESM(require_picocolors(), 1);
import { EventEmitter } from "events";

// node_modules/goke/dist/mri.js
function toArr(any) {
  return any == null ? [] : Array.isArray(any) ? any : [any];
}
function toVal(out, key, val, opts) {
  const old = out[key];
  const nxt = ~opts.string.indexOf(key) ? val == null || val === true ? "" : String(val) : typeof val === "boolean" ? val : ~opts.boolean.indexOf(key) ? val === "false" ? false : val === "true" || (out._.push(val), !!val) : val;
  out[key] = old == null ? nxt : Array.isArray(old) ? old.concat(nxt) : [old, nxt];
}
function mri(args, opts) {
  args = args || [];
  opts = opts || {};
  let k;
  let arr;
  let arg;
  let name;
  let val;
  const out = { _: [] };
  let i = 0;
  let j = 0;
  let idx = 0;
  const len = args.length;
  const alibi = opts.alias !== undefined;
  const strict = opts.unknown !== undefined;
  const defaults = opts.default !== undefined;
  const alias = opts.alias || {};
  const string = toArr(opts.string);
  const boolean = toArr(opts.boolean);
  const resolvedOpts = { alias, string, boolean, default: opts.default, unknown: opts.unknown, _: out._ };
  if (alibi) {
    for (k in alias) {
      arr = alias[k] = toArr(alias[k]);
      for (i = 0;i < arr.length; i++) {
        (alias[arr[i]] = arr.concat(k)).splice(i, 1);
      }
    }
  }
  for (i = boolean.length;i-- > 0; ) {
    arr = alias[boolean[i]] || [];
    for (j = arr.length;j-- > 0; )
      boolean.push(arr[j]);
  }
  for (i = string.length;i-- > 0; ) {
    arr = alias[string[i]] || [];
    for (j = arr.length;j-- > 0; )
      string.push(arr[j]);
  }
  if (defaults) {
    for (k in opts.default) {
      name = typeof opts.default[k];
      arr = alias[k] = alias[k] || [];
      if (resolvedOpts[name] !== undefined) {
        resolvedOpts[name].push(k);
        for (i = 0;i < arr.length; i++) {
          resolvedOpts[name].push(arr[i]);
        }
      }
    }
  }
  const keys = strict ? Object.keys(alias) : [];
  for (i = 0;i < len; i++) {
    arg = args[i];
    if (arg === "--") {
      out._ = out._.concat(args.slice(++i));
      break;
    }
    for (j = 0;j < arg.length; j++) {
      if (arg.charCodeAt(j) !== 45)
        break;
    }
    if (j === 0) {
      out._.push(arg);
    } else {
      for (idx = j + 1;idx < arg.length; idx++) {
        if (arg.charCodeAt(idx) === 61)
          break;
      }
      name = arg.substring(j, idx);
      val = arg.substring(++idx) || (i + 1 === len || ("" + args[i + 1]).charCodeAt(0) === 45 || args[++i]);
      arr = j === 2 ? [name] : name;
      for (idx = 0;idx < arr.length; idx++) {
        name = arr[idx];
        if (strict && !~keys.indexOf(name))
          return opts.unknown("-".repeat(j) + name);
        toVal(out, name, idx + 1 < arr.length || val, resolvedOpts);
      }
    }
  }
  if (defaults) {
    for (k in opts.default) {
      if (out[k] === undefined) {
        out[k] = opts.default[k];
      }
    }
  }
  if (alibi) {
    for (k in out) {
      arr = alias[k] || [];
      while (arr.length > 0) {
        out[arr.shift()] = out[k];
      }
    }
  }
  return out;
}

// node_modules/goke/dist/coerce.js
function schemaIsArray(schema) {
  if (schema.type === "array")
    return true;
  if (!schema.type && schema.items)
    return true;
  return false;
}
function normalizeJsonSchema(raw) {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  return raw;
}
function coerceBySchema(value, rawSchema, optionName) {
  const schema = normalizeJsonSchema(rawSchema);
  if (Array.isArray(value)) {
    if (schemaIsArray(schema)) {
      if (schema.items) {
        return value.map((v) => coerceBySchema(v, schema.items, optionName));
      }
      return value;
    }
    if (Array.isArray(schema.type) && schema.type.includes("array")) {
      if (schema.items) {
        return value.map((v) => coerceBySchema(v, schema.items, optionName));
      }
      return value;
    }
    const unionVariants = schema.anyOf || schema.oneOf;
    if (unionVariants) {
      const arrayVariant = unionVariants.find((v) => schemaIsArray(v));
      if (arrayVariant) {
        const itemsSchema = arrayVariant.items;
        if (itemsSchema) {
          return value.map((v) => coerceBySchema(v, itemsSchema, optionName));
        }
        return value;
      }
    }
    throw new Error(`Option --${optionName} does not accept multiple values. ` + `Use an array schema (e.g. { type: "array" }) to allow repeated flags.`);
  }
  if (schemaIsArray(schema)) {
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          if (schema.items) {
            return parsed.map((item) => {
              if (typeof item === "string" || typeof item === "boolean") {
                return coerceBySchema(item, schema.items, optionName);
              }
              return item;
            });
          }
          return parsed;
        }
      } catch {}
    }
    if (schema.items) {
      return [coerceBySchema(value, schema.items, optionName)];
    }
    return [value];
  }
  if (schema.enum) {
    for (const allowed of schema.enum) {
      if (typeof allowed === "number") {
        const num = +String(value);
        if (num * 0 === 0 && num === allowed)
          return num;
      } else if (typeof allowed === "boolean") {
        if (value === "true" && allowed === true)
          return true;
        if (value === "false" && allowed === false)
          return false;
        if (value === allowed)
          return value;
      } else if (String(value) === String(allowed)) {
        return allowed;
      }
    }
    throw new Error(`Invalid value for --${optionName}: expected one of ${schema.enum.map((v) => JSON.stringify(v)).join(", ")}, got ${JSON.stringify(value)}`);
  }
  if (schema.const !== undefined) {
    const constVal = schema.const;
    const targetType = constVal === null ? "null" : typeof constVal;
    const coerced = coerceToSingleType(value, targetType, optionName);
    if (coerced === constVal)
      return coerced;
    throw new Error(`Invalid value for --${optionName}: expected ${JSON.stringify(constVal)}, got ${JSON.stringify(value)}`);
  }
  if (schema.anyOf || schema.oneOf) {
    const variants = schema.anyOf || schema.oneOf || [];
    for (const variant of variants) {
      try {
        return coerceBySchema(value, variant, optionName);
      } catch {}
    }
    throw new Error(`Invalid value for --${optionName}: ${JSON.stringify(value)} does not match any allowed type`);
  }
  if (schema.allOf && schema.allOf.length > 0) {
    return coerceBySchema(value, schema.allOf[0], optionName);
  }
  const schemaType = schema.type;
  if (!schemaType) {
    if (schema.properties || schema.additionalProperties) {
      return coerceToSingleType(value, "object", optionName);
    }
    if (schema.items) {
      return coerceToSingleType(value, "array", optionName);
    }
    return value;
  }
  if (Array.isArray(schemaType)) {
    for (const t of schemaType) {
      try {
        return coerceToSingleType(value, t, optionName);
      } catch {}
    }
    throw new Error(`Invalid value for --${optionName}: expected ${schemaType.join(" or ")}, got ${JSON.stringify(value)}`);
  }
  return coerceToSingleType(value, schemaType, optionName);
}
function coerceToSingleType(value, targetType, optionName) {
  switch (targetType) {
    case "string":
      return coerceToString(value);
    case "number":
      return coerceToNumber(value, optionName);
    case "integer":
      return coerceToInteger(value, optionName);
    case "boolean":
      return coerceToBoolean(value, optionName);
    case "null":
      return coerceToNull(value, optionName);
    case "object":
      return coerceToObject(value, optionName);
    case "array":
      return coerceToArray(value, optionName);
    default:
      return value;
  }
}
function coerceToString(value) {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return value;
}
function coerceToNumber(value, optionName) {
  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }
  if (value === "") {
    throw new Error(`Invalid value for --${optionName}: expected number, got empty string`);
  }
  const num = +value;
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid value for --${optionName}: expected number, got ${JSON.stringify(value)}`);
  }
  return num;
}
function coerceToInteger(value, optionName) {
  const num = coerceToNumber(value, optionName);
  if (num % 1 !== 0) {
    throw new Error(`Invalid value for --${optionName}: expected integer, got ${JSON.stringify(value)}`);
  }
  return num;
}
function coerceToBoolean(value, optionName) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true")
    return true;
  if (value === "false")
    return false;
  throw new Error(`Invalid value for --${optionName}: expected true or false, got ${JSON.stringify(value)}`);
}
function coerceToNull(value, optionName) {
  if (typeof value === "string" && value === "")
    return null;
  throw new Error(`Invalid value for --${optionName}: expected empty string for null, got ${JSON.stringify(value)}`);
}
function coerceToObject(value, optionName) {
  if (typeof value !== "string") {
    throw new Error(`Invalid value for --${optionName}: expected JSON object, got ${typeof value}`);
  }
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("not an object");
    }
    return parsed;
  } catch {
    throw new Error(`Invalid value for --${optionName}: expected valid JSON object, got ${JSON.stringify(value)}`);
  }
}
function coerceToArray(value, optionName) {
  if (typeof value !== "string") {
    throw new Error(`Invalid value for --${optionName}: expected JSON array, got ${typeof value}`);
  }
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      throw new Error("not an array");
    }
    return parsed;
  } catch {
    throw new Error(`Invalid value for --${optionName}: expected valid JSON array, got ${JSON.stringify(value)}`);
  }
}
function hasStandardProp(schema) {
  if (!("~standard" in schema))
    return false;
  const std = schema["~standard"];
  return std != null && typeof std === "object";
}
function isJsonSchemaConverter(converter) {
  return converter != null && typeof converter === "object" && "input" in converter && typeof converter.input === "function";
}
function extractJsonSchema(schema) {
  if (!schema || typeof schema !== "object")
    return;
  if (!hasStandardProp(schema))
    return;
  const converter = schema["~standard"].jsonSchema;
  if (!isJsonSchemaConverter(converter))
    return;
  try {
    return converter.input({ target: "draft-2020-12" });
  } catch {
    try {
      return converter.input({ target: "draft-07" });
    } catch {
      return;
    }
  }
}
function isStandardSchema(value) {
  if (!value || typeof value !== "object")
    return false;
  if (!hasStandardProp(value))
    return false;
  return isJsonSchemaConverter(value["~standard"].jsonSchema);
}
function extractSchemaMetadata(schema) {
  const jsonSchema = extractJsonSchema(schema);
  if (!jsonSchema)
    return {};
  const result = {};
  if (typeof jsonSchema.description === "string") {
    result.description = jsonSchema.description;
  }
  if (jsonSchema.default !== undefined) {
    result.default = jsonSchema.default;
  }
  return result;
}

// node_modules/goke/dist/goke.js
var processArgs = process.argv;
var platformInfo = `${process.platform}-${process.arch} node-${process.version}`;
var removeBrackets = (v) => v.replace(/[<[].+/, "").trim();
var findAllBrackets = (v) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
  const res = [];
  const parse = (match) => {
    let variadic = false;
    let value = match[1];
    if (value.startsWith("...")) {
      value = value.slice(3);
      variadic = true;
    }
    return {
      required: match[0].startsWith("<"),
      value,
      variadic
    };
  };
  let angledMatch;
  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }
  let squareMatch;
  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }
  return res;
};
var getMriOptions = (options) => {
  const result = { alias: {}, boolean: [] };
  for (const option of options) {
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    }
    if (option.isBoolean) {
      result.boolean.push(option.names[0]);
    }
  }
  return result;
};
var maxVisibleLength = (arr) => {
  return arr.reduce((max, value) => {
    return Math.max(max, visibleLength(value));
  }, 0);
};
var ANSI_RE = /\x1B\[[0-9;]*m/g;
var visibleLength = (value) => value.replace(ANSI_RE, "").length;
var commandOrange = (value) => {
  if (!import_picocolors.default.isColorSupported) {
    return value;
  }
  return `\x1B[38;5;208m${value}\x1B[39m`;
};
var optionYellow = (value) => import_picocolors.default.bold(import_picocolors.default.yellowBright(value));
var padRight = (str, length) => {
  return visibleLength(str) >= length ? str : `${str}${" ".repeat(length - visibleLength(str))}`;
};
var wrapLine = (line, width) => {
  if (width <= 0 || visibleLength(line) <= width) {
    return [line];
  }
  const words = line.trim().split(/\s+/);
  const wrapped = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (visibleLength(next) <= width) {
      current = next;
      continue;
    }
    if (current) {
      wrapped.push(current);
    }
    if (visibleLength(word) <= width) {
      current = word;
      continue;
    }
    let remaining = word;
    while (visibleLength(remaining) > width) {
      wrapped.push(remaining.slice(0, width));
      remaining = remaining.slice(width);
    }
    current = remaining;
  }
  if (current) {
    wrapped.push(current);
  }
  return wrapped;
};
var wrapDescription = (text, width) => {
  const maxWidth = Math.max(20, width);
  return text.split(`
`).flatMap((line) => {
    if (line.trim() === "") {
      return [""];
    }
    return wrapLine(line, maxWidth);
  });
};
var formatWrappedDescription = (text, width, indent) => {
  const lines = wrapDescription(text, width).map((line) => line ? import_picocolors.default.dim(line) : line);
  if (lines.length === 0) {
    return "";
  }
  return [
    lines[0],
    ...lines.slice(1).map((line) => `${" ".repeat(indent)}${line}`)
  ].join(`
`);
};
var optionDescriptionText = (option) => {
  const defaultText = option.default === undefined ? "" : ` ${import_picocolors.default.cyan(`(default: ${String(option.default)})`)}`;
  return `${option.description}${defaultText}`.trim();
};
var camelcase = (input) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};
var setDotProp = (obj, keys, val) => {
  let i = 0;
  let length = keys.length;
  let t = obj;
  let x;
  for (;i < length; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
  }
};
var getFileName = (input) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : "";
};
var camelcaseOptionName = (name) => {
  return name.split(".").map((v, i) => {
    return i === 0 ? camelcase(v) : v;
  }).join(".");
};

class GokeError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class Option {
  rawName;
  name;
  names;
  isBoolean;
  required;
  description;
  default;
  schema;
  constructor(rawName, descriptionOrSchema) {
    this.rawName = rawName;
    if (typeof descriptionOrSchema === "string") {
      this.description = descriptionOrSchema;
    } else if (descriptionOrSchema && isStandardSchema(descriptionOrSchema)) {
      this.schema = descriptionOrSchema;
      const meta = extractSchemaMetadata(descriptionOrSchema);
      this.description = meta.description ?? "";
      if (meta.default !== undefined) {
        this.default = meta.default;
      }
    } else {
      this.description = "";
    }
    rawName = rawName.replace(/\.\*/g, "");
    this.names = removeBrackets(rawName).split(",").map((v) => {
      let name = v.trim().replace(/^-{1,2}/, "");
      return camelcaseOptionName(name);
    }).sort((a, b) => a.length > b.length ? 1 : -1);
    this.name = this.names[this.names.length - 1];
    if (rawName.includes("<")) {
      this.required = true;
    } else if (rawName.includes("[")) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
  }
}

class Command {
  rawName;
  description;
  config;
  cli;
  options;
  aliasNames;
  name;
  args;
  commandAction;
  usageText;
  versionNumber;
  examples;
  helpCallback;
  globalCommand;
  constructor(rawName, description, config = {}, cli) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli;
    this.options = [];
    this.aliasNames = [];
    this.name = removeBrackets(rawName);
    this.args = findAllBrackets(rawName);
    this.examples = [];
  }
  usage(text) {
    this.usageText = text;
    return this;
  }
  allowUnknownOptions() {
    this.config.allowUnknownOptions = true;
    return this;
  }
  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.versionNumber = version;
    this.option(customFlags, "Display version number");
    return this;
  }
  example(example) {
    this.examples.push(example);
    return this;
  }
  option(rawName, descriptionOrSchema) {
    const option = new Option(rawName, descriptionOrSchema);
    this.options.push(option);
    return this;
  }
  alias(name) {
    this.aliasNames.push(name);
    return this;
  }
  action(callback) {
    this.commandAction = callback;
    return this;
  }
  isMatched(args) {
    const nameParts = this.name.split(" ").filter(Boolean);
    if (nameParts.length === 0) {
      return { matched: false, consumedArgs: 0 };
    }
    if (args.length < nameParts.length) {
      return { matched: false, consumedArgs: 0 };
    }
    for (let i = 0;i < nameParts.length; i++) {
      if (nameParts[i] !== args[i]) {
        if (i === 0 && this.aliasNames.includes(args[i])) {
          continue;
        }
        return { matched: false, consumedArgs: 0 };
      }
    }
    return { matched: true, consumedArgs: nameParts.length };
  }
  get isDefaultCommand() {
    return this.name === "" || this.aliasNames.includes("!");
  }
  get isGlobalCommand() {
    return this instanceof GlobalCommand;
  }
  hasOption(name) {
    name = name.split(".")[0];
    return this.options.find((option) => {
      return option.names.includes(name);
    });
  }
  outputHelp() {
    const { name, commands } = this.cli;
    const { versionNumber, options: globalOptions, helpCallback } = this.cli.globalCommand;
    let sections = [
      {
        body: import_picocolors.default.bold(import_picocolors.default.cyan(`${name}${versionNumber ? `/${versionNumber}` : ""}`))
      }
    ];
    sections.push({
      title: "Usage",
      body: `  ${import_picocolors.default.green("$")} ${import_picocolors.default.bold(name)} ${this.usageText || this.rawName || "[options]"}`
    });
    const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
    const terminalWidth = Math.max(this.cli.columns, 40);
    if (showCommands) {
      const commandRows = commands.map((command) => {
        const displayName = command.rawName.trim() === "" ? name : command.rawName;
        const displayOptions = command.isDefaultCommand ? [] : command.options;
        return {
          command,
          displayName,
          displayOptions
        };
      });
      const longestCommandNameLength = maxVisibleLength(commandRows.map((row) => row.displayName));
      const longestCommandOptions = commandRows.flatMap((row) => row.displayOptions.map((option) => option.rawName));
      const longestCommandOptionNameLength = maxVisibleLength(longestCommandOptions);
      const commandDescriptionColumn = 2 + longestCommandNameLength + 2;
      const optionDescriptionColumn = 4 + longestCommandOptionNameLength + 2;
      const sharedDescriptionColumn = Math.max(commandDescriptionColumn, optionDescriptionColumn);
      const descriptionWidth = terminalWidth - sharedDescriptionColumn;
      sections.push({
        title: "Commands",
        body: commandRows.map(({ command, displayName, displayOptions }) => {
          const commandDescription = formatWrappedDescription(command.description, descriptionWidth, sharedDescriptionColumn);
          const commandPrefix = `  ${import_picocolors.default.bold(commandOrange(displayName))}`;
          const commandPadding = " ".repeat(Math.max(2, sharedDescriptionColumn - (2 + visibleLength(displayName))));
          const headerLine = commandDescription ? `${commandPrefix}${commandPadding}${commandDescription}` : commandPrefix;
          if (displayOptions.length === 0) {
            return headerLine;
          }
          const optionLines = displayOptions.map((option) => {
            const optionDescription = formatWrappedDescription(optionDescriptionText(option), descriptionWidth, sharedDescriptionColumn);
            const optionPrefix = `    ${optionYellow(option.rawName)}`;
            const optionPadding = " ".repeat(Math.max(2, sharedDescriptionColumn - (4 + visibleLength(option.rawName))));
            return optionDescription ? `${optionPrefix}${optionPadding}${optionDescription}` : optionPrefix;
          }).join(`
`);
          return `${headerLine}
${optionLines}`;
        }).join(`

`)
      });
    }
    const defaultCommandOptions = this.isGlobalCommand ? commands.filter((command) => command.isDefaultCommand).flatMap((command) => command.options) : [];
    const mergedGlobalAndDefaultOptions = [...globalOptions];
    const mergedOptionNames = new Set(globalOptions.map((option) => option.name));
    for (const option of defaultCommandOptions) {
      if (!mergedOptionNames.has(option.name)) {
        mergedGlobalAndDefaultOptions.push(option);
        mergedOptionNames.add(option.name);
      }
    }
    const mergedCommandAndGlobalOptions = [...this.options];
    const mergedCommandOptionNames = new Set(this.options.map((option) => option.name));
    for (const option of globalOptions || []) {
      if (!mergedCommandOptionNames.has(option.name)) {
        mergedCommandAndGlobalOptions.push(option);
        mergedCommandOptionNames.add(option.name);
      }
    }
    let options = this.isGlobalCommand ? mergedGlobalAndDefaultOptions : mergedCommandAndGlobalOptions;
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionNameLength = maxVisibleLength(options.map((option) => option.rawName));
      const descriptionColumn = 2 + longestOptionNameLength + 2;
      const descriptionWidth = terminalWidth - descriptionColumn;
      sections.push({
        title: "Options",
        body: options.map((option) => {
          const optionLabel = padRight(option.rawName, longestOptionNameLength);
          const description = formatWrappedDescription(optionDescriptionText(option), descriptionWidth, descriptionColumn);
          return description ? `  ${optionYellow(optionLabel)}  ${description}` : `  ${optionYellow(optionLabel)}`;
        }).join(`
`)
      });
    }
    if (!this.isGlobalCommand && !this.isDefaultCommand && this.description) {
      const descriptionLines = wrapDescription(this.description, terminalWidth - 2);
      sections.push({
        title: "Description",
        body: descriptionLines.map((line) => line ? `  ${import_picocolors.default.dim(line)}` : "").join(`
`)
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples.map((example) => {
          if (typeof example === "function") {
            return example(name);
          }
          return example;
        }).join(`
`)
      });
    }
    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }
    this.cli.console.log(sections.map((section) => {
      return section.title ? `${import_picocolors.default.bold(import_picocolors.default.blue(section.title))}:
${section.body}` : section.body;
    }).join(`

`));
  }
  outputVersion() {
    const { name } = this.cli;
    const { versionNumber } = this.cli.globalCommand;
    if (versionNumber) {
      this.cli.console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }
  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new GokeError(`missing required args for command \`${this.rawName}\``);
    }
  }
  checkUnknownOptions() {
    const { options, globalCommand } = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new GokeError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }
  checkOptionValue() {
    const { options: parsedOptions, globalCommand } = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const keys = option.name.split(".");
      let value = parsedOptions;
      for (const key of keys) {
        if (value != null && typeof value === "object") {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
      if (option.required) {
        if (value === true || value === false) {
          throw new GokeError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
}

class GlobalCommand extends Command {
  constructor(cli) {
    super("@@global@@", "", {}, cli);
  }
}
function createConsole(stdout, stderr) {
  return {
    log(...args) {
      stdout.write(args.map(String).join(" ") + `
`);
    },
    error(...args) {
      stderr.write(args.map(String).join(" ") + `
`);
    }
  };
}

class Goke extends EventEmitter {
  name;
  commands;
  globalCommand;
  matchedCommand;
  matchedCommandName;
  rawArgs;
  args;
  options;
  showHelpOnExit;
  showVersionOnExit;
  stdout;
  stderr;
  console;
  columns;
  #defaultArgv;
  constructor(name = "", options) {
    super();
    this.name = name;
    this.commands = [];
    this.rawArgs = [];
    this.args = [];
    this.options = {};
    this.stdout = options?.stdout ?? process.stdout;
    this.stderr = options?.stderr ?? process.stderr;
    this.console = createConsole(this.stdout, this.stderr);
    this.columns = options?.columns ?? process.stdout.columns ?? Number.POSITIVE_INFINITY;
    this.#defaultArgv = options?.argv ?? processArgs;
    this.globalCommand = new GlobalCommand(this);
    this.globalCommand.usage("<command> [options]");
  }
  usage(text) {
    this.globalCommand.usage(text);
    return this;
  }
  command(rawName, description, config) {
    const command = new Command(rawName, description || "", config, this);
    command.globalCommand = this.globalCommand;
    this.commands.push(command);
    return command;
  }
  option(rawName, descriptionOrSchema) {
    this.globalCommand.option(rawName, descriptionOrSchema);
    return this;
  }
  help(callback) {
    this.globalCommand.option("-h, --help", "Display this message");
    this.globalCommand.helpCallback = callback;
    this.showHelpOnExit = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.globalCommand.version(version, customFlags);
    this.showVersionOnExit = true;
    return this;
  }
  example(example) {
    this.globalCommand.example(example);
    return this;
  }
  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }
  outputHelpForPrefix(prefix, matchingCommands, fromHelpFlag = false) {
    const { versionNumber } = this.globalCommand;
    this.console.log(`${this.name}${versionNumber ? `/${versionNumber}` : ""}`);
    this.console.log();
    if (!fromHelpFlag) {
      this.console.log(`Unknown command: ${this.args.join(" ")}`);
      this.console.log();
    }
    this.console.log(`Available "${prefix}" commands:`);
    this.console.log();
    const longestName = Math.max(...matchingCommands.map((c) => c.rawName.length));
    for (const cmd of matchingCommands) {
      const firstLine = cmd.description.split(`
`)[0].trim();
      this.console.log(`  ${cmd.rawName.padEnd(longestName)}  ${firstLine}`);
    }
    this.console.log();
    this.console.log(`Run "${this.name} <command> --help" for more information.`);
  }
  outputVersion() {
    this.globalCommand.outputVersion();
  }
  setParsedInfo({ args, options }, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    if (matchedCommand) {
      this.matchedCommand = matchedCommand;
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName;
    }
    return this;
  }
  unsetMatchedCommand() {
    this.matchedCommand = undefined;
    this.matchedCommandName = undefined;
  }
  parse(argv = this.#defaultArgv, {
    run = true
  } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : "cli";
    }
    let shouldParse = true;
    const sortedCommands = [...this.commands].sort((a, b) => {
      const aLength = a.name.split(" ").filter(Boolean).length;
      const bLength = b.name.split(" ").filter(Boolean).length;
      return bLength - aLength;
    });
    for (const command of sortedCommands) {
      const parsed = this.mri(argv.slice(2), command);
      const result = command.isMatched(parsed.args);
      if (result.matched) {
        shouldParse = false;
        const matchedCommandName = parsed.args.slice(0, result.consumedArgs).join(" ");
        const parsedInfo = {
          ...parsed,
          args: parsed.args.slice(result.consumedArgs)
        };
        this.setParsedInfo(parsedInfo, command, matchedCommandName);
        this.emit(`command:${matchedCommandName}`, command);
        break;
      }
    }
    if (shouldParse) {
      for (const command of this.commands) {
        if (command.name === "") {
          const parsed = this.mri(argv.slice(2), command);
          const firstArg = parsed.args[0];
          if (firstArg) {
            const isPrefixOfCommand = this.commands.some((cmd) => {
              if (cmd.name === "")
                return false;
              const cmdParts = cmd.name.split(" ");
              return cmdParts[0] === firstArg;
            });
            if (isPrefixOfCommand) {
              continue;
            }
          }
          shouldParse = false;
          this.setParsedInfo(parsed, command);
          this.emit(`command:!`, command);
        }
      }
    }
    if (shouldParse) {
      const parsed = this.mri(argv.slice(2));
      this.setParsedInfo(parsed);
    }
    if (this.options.help && this.showHelpOnExit) {
      if (!this.matchedCommand && this.args[0]) {
        const firstArg = this.args[0];
        const matchingCommands = this.commands.filter((cmd) => {
          if (cmd.name === "")
            return false;
          const cmdParts = cmd.name.split(" ");
          return cmdParts[0] === firstArg;
        });
        if (matchingCommands.length > 0) {
          this.outputHelpForPrefix(firstArg, matchingCommands, true);
        } else {
          this.outputHelp();
        }
      } else {
        this.outputHelp();
      }
      run = false;
      this.unsetMatchedCommand();
    }
    if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
      this.outputVersion();
      run = false;
      this.unsetMatchedCommand();
    }
    const parsedArgv = { args: this.args, options: this.options };
    if (run) {
      this.runMatchedCommand();
    }
    if (!this.matchedCommand && this.args[0] && !(this.options.help && this.showHelpOnExit)) {
      this.emit("command:*");
      if (this.showHelpOnExit) {
        const firstArg = this.args[0];
        const matchingCommands = this.commands.filter((cmd) => {
          if (cmd.name === "")
            return false;
          const cmdParts = cmd.name.split(" ");
          return cmdParts[0] === firstArg;
        });
        if (matchingCommands.length > 0) {
          this.outputHelpForPrefix(firstArg, matchingCommands);
        } else {
          this.outputHelp();
        }
      }
    }
    if (!this.matchedCommand && this.args.length === 0 && this.showHelpOnExit && !(this.options.help && this.showHelpOnExit)) {
      this.outputHelp();
    }
    return parsedArgv;
  }
  mri(argv, command) {
    const cliOptions = [
      ...this.globalCommand.options,
      ...command ? command.options : []
    ];
    const mriOptions = getMriOptions(cliOptions);
    let argsAfterDoubleDashes = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }
    let parsed = mri(argv, mriOptions);
    parsed = Object.keys(parsed).reduce((res, name) => {
      return {
        ...res,
        [camelcaseOptionName(name)]: parsed[name]
      };
    }, { _: [] });
    const args = parsed._;
    const options = {
      "--": argsAfterDoubleDashes
    };
    const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
    const schemaMap = new Map;
    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.default !== undefined) {
        for (const name of cliOption.names) {
          const keys = name.split(".");
          setDotProp(options, keys, cliOption.default);
        }
      }
      if (cliOption.schema) {
        const jsonSchema = extractJsonSchema(cliOption.schema);
        if (jsonSchema) {
          schemaMap.set(cliOption.name, { jsonSchema, optionName: cliOption.name });
          for (const alias of cliOption.names) {
            schemaMap.set(alias, { jsonSchema, optionName: cliOption.name });
          }
        }
      }
    }
    const requiredValueOptions = new Set;
    const optionalValueOptions = new Set;
    for (const cliOption of cliOptions) {
      if (cliOption.required === true) {
        for (const name of cliOption.names) {
          requiredValueOptions.add(name);
        }
      } else if (cliOption.required === false) {
        for (const name of cliOption.names) {
          optionalValueOptions.add(name);
        }
      }
    }
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        let value = parsed[key];
        const schemaInfo = schemaMap.get(key);
        if (schemaInfo && value !== undefined) {
          if (value === true && requiredValueOptions.has(key)) {} else if (value === true && optionalValueOptions.has(key)) {
            value = undefined;
          } else {
            value = coerceBySchema(value, schemaInfo.jsonSchema, schemaInfo.optionName);
          }
        }
        setDotProp(options, keys, value);
      }
    }
    return {
      args,
      options
    };
  }
  runMatchedCommand() {
    const { args, options, matchedCommand: command } = this;
    if (!command || !command.commandAction)
      return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();
    const actionArgs = [];
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index));
      } else {
        actionArgs.push(args[index]);
      }
    });
    actionArgs.push(options);
    return command.commandAction.apply(this, actionArgs);
  }
}
var goke_default = Goke;

// node_modules/goke/dist/index.js
var goke = (name = "", options) => new goke_default(name, options);
var dist_default = goke;

// src/cli/index.ts
import { existsSync as existsSync2, readFileSync as readFileSync2 } from "node:fs";
import { dirname as dirname2, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// src/util/colors.ts
var import_picocolors2 = __toESM(require_picocolors(), 1);
var colors = import_picocolors2.createColors(process.env.NO_COLOR === undefined);
function setColorEnabled(enabled) {
  colors = import_picocolors2.createColors(enabled);
}
function isColorEnabled(noColorFlag) {
  if (noColorFlag)
    return false;
  return process.env.NO_COLOR === undefined;
}
function c() {
  return colors;
}

// src/output/text.ts
function bucketColor(bucket) {
  const colors2 = c();
  if (bucket === "pass")
    return colors2.green(bucket);
  if (bucket === "fail")
    return colors2.red(bucket);
  if (bucket === "pending")
    return colors2.yellow(bucket);
  return colors2.dim(bucket);
}
function renderThreads(threads) {
  const colors2 = c();
  if (threads.length === 0)
    return "No review threads found.";
  return [
    colors2.bold(`Threads (${threads.length})`),
    ...threads.map((thread) => {
      const line = thread.line ?? "-";
      const status = thread.isResolved ? colors2.green("resolved") : colors2.yellow("open");
      return `- ${thread.id} ${thread.path}:${line} by ${thread.latestAuthor} [${status}]`;
    })
  ].join(`
`);
}
function renderChecks(checks) {
  const colors2 = c();
  if (checks.length === 0)
    return "No checks found.";
  return [
    colors2.bold("Checks"),
    ...checks.map((check) => `- [${bucketColor(check.bucket)}] ${check.name} (${check.state})`)
  ].join(`
`);
}
function renderRun(run) {
  const colors2 = c();
  const statusColor = run.conclusion === "success" ? colors2.green : run.conclusion === "failure" ? colors2.red : colors2.yellow;
  return [
    colors2.bold(`Run #${run.databaseId} ${run.workflowName}`),
    `Status: ${statusColor(run.status)} ${run.conclusion ? `(${statusColor(run.conclusion)})` : ""}`,
    ...run.jobs.map((job) => `- ${job.name}: ${job.status}${job.conclusion ? ` (${job.conclusion})` : ""}`)
  ].join(`
`);
}
function renderAnnotations(annotations) {
  const colors2 = c();
  if (annotations.length === 0)
    return "No annotations found.";
  return [
    colors2.bold(`Annotations (${annotations.length})`),
    ...annotations.map((a) => `- ${a.path}:${a.start_line} [${a.annotation_level}] ${a.message}`)
  ].join(`
`);
}
function renderNextStep(step) {
  const colors2 = c();
  return [
    colors2.bold(`Next: PR #${step.pr} (${step.kind})`),
    `Reason: ${step.reason}`,
    `Command: ${colors2.cyan(step.command)}`
  ].join(`
`);
}
function renderCiDiagnosis(result) {
  const colors2 = c();
  const filesPreview = result.annotationsByPath.slice(0, 10);
  const logBlocks = result.logsByJob.map((log) => [
    colors2.bold(`Log tail job ${log.jobId} (${log.jobName}) lines=${log.tailLines}`),
    log.logTail || "<no log output>"
  ].join(`
`));
  return [
    colors2.bold(`Run #${result.run.databaseId} ${result.run.workflowName}`),
    `Status: ${result.run.status}${result.run.conclusion ? ` (${result.run.conclusion})` : ""}`,
    `Failing jobs: ${result.failingJobs.length}`,
    ...logBlocks,
    filesPreview.length > 0 ? [
      colors2.bold(`Annotations by file (${result.annotationsCount})`),
      ...filesPreview.map((group) => `- ${group.path}: ${group.count}`)
    ].join(`
`) : "No annotations found.",
    `${colors2.bold("Suggested next action:")} ${result.suggestedNextAction}`,
    `${colors2.bold("Suggested command:")} ${colors2.cyan(result.suggestedNextCommand)}`
  ].join(`

`);
}
function renderCiMutation(result) {
  const colors2 = c();
  const details = result.mode === "job" ? `job=${result.jobId}` : result.mode === "failed" ? "failed-jobs" : "full-run";
  return [
    colors2.bold(`CI ${result.action} requested for run #${result.runId}`),
    `Scope: ${details}`,
    `Repo: ${result.repo}`,
    `Command: ${colors2.cyan(result.command)}`
  ].join(`
`);
}

// src/util/errors.ts
class CliError extends Error {
  exitCode;
  constructor(message, exitCode = 1) {
    super(message);
    this.name = "CliError";
    this.exitCode = exitCode;
  }
}

// src/util/gh.ts
import { spawnSync } from "node:child_process";
function ghExec(args, options = {}) {
  const fullArgs = [...args];
  const supportsRepoFlag = fullArgs[0] !== "api";
  if (supportsRepoFlag && options.repo && !fullArgs.includes("-R") && !fullArgs.includes("--repo")) {
    fullArgs.push("-R", options.repo);
  }
  const proc = spawnSync("gh", fullArgs, {
    encoding: "utf8"
  });
  const stdout = (proc.stdout || "").trim();
  const stderr = (proc.stderr || "").trim();
  if (proc.status !== 0 && !options.allowFailure) {
    throw new CliError(stderr || `gh ${fullArgs.join(" ")} failed`, proc.status || 1);
  }
  return stdout;
}
function ghJson(args, options = {}) {
  const raw = ghExec(args, options);
  try {
    return JSON.parse(raw);
  } catch {
    throw new CliError(`Expected JSON from: gh ${args.join(" ")}`);
  }
}

// src/github/rest.ts
function getJson(path, repo) {
  return ghJson(["api", path], { repo });
}

// src/services/pr-service.ts
import { spawnSync as spawnSync2 } from "node:child_process";
var prFields = [
  "number",
  "title",
  "url",
  "baseRefName",
  "headRefName",
  "headRefOid",
  "mergeStateStatus",
  "mergeable",
  "reviewDecision",
  "reviewRequests",
  "isDraft"
].join(",");
function resolvePr(target, repo) {
  const baseArgs = ["pr", "view"];
  if (target)
    baseArgs.push(target);
  baseArgs.push("--json", prFields);
  let pr;
  try {
    if (target) {
      pr = ghJson(baseArgs, { repo: repo.fullName });
    } else {
      pr = ghJson(baseArgs);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!target) {
      const branch = currentBranch();
      if (branch) {
        try {
          pr = ghJson(["pr", "view", branch, "--json", prFields], { repo: repo.fullName });
          if (pr?.number)
            return pr;
        } catch {}
      }
    }
    if (!target) {
      throw new CliError("No pull request is associated with the current branch. Pass a PR number, URL, or branch (for example: `gh prx context 123`).");
    }
    throw new CliError(`Could not resolve PR from '${target}': ${message}`);
  }
  if (!pr || !pr.number) {
    throw new CliError("Could not resolve PR from target. Try passing a PR number.");
  }
  return {
    ...pr,
    reviewRequestsCount: Array.isArray(pr.reviewRequests) ? pr.reviewRequests.length : 0
  };
}
function currentBranch() {
  const proc = spawnSync2("git", ["branch", "--show-current"], {
    encoding: "utf8"
  });
  if (proc.status !== 0)
    return null;
  const branch = (proc.stdout || "").trim();
  return branch || null;
}
function listChecks(prNumber, repo) {
  const fields = ["name", "state", "bucket", "workflow", "link", "startedAt", "completedAt"].join(",");
  try {
    return ghJson(["pr", "checks", String(prNumber), "--json", fields], {
      repo: repo.fullName
    });
  } catch {
    return [];
  }
}

// src/services/ci-service.ts
function isNumeric(value) {
  return Boolean(value && /^\d+$/.test(value));
}
function parseCheckRunId(checkRunUrl) {
  const raw = checkRunUrl.split("/").pop();
  if (!raw || !isNumeric(raw))
    return null;
  return Number(raw);
}
function listRunJobs(repo, runId) {
  const jobs = [];
  let page = 1;
  while (true) {
    const response = getJson(`repos/${repo.fullName}/actions/runs/${runId}/jobs?per_page=100&page=${page}`, repo.fullName);
    jobs.push(...response.jobs);
    if (response.jobs.length < 100)
      break;
    page += 1;
  }
  return jobs;
}
function listAnnotationsForCheckRun(repo, checkRunId) {
  const annotations = [];
  let page = 1;
  while (true) {
    const pageResult = getJson(`repos/${repo.fullName}/check-runs/${checkRunId}/annotations?per_page=100&page=${page}`, repo.fullName);
    annotations.push(...pageResult);
    if (pageResult.length < 100)
      break;
    page += 1;
  }
  return annotations;
}
function resolveRunId(repo, target, targetMode = "auto") {
  if (targetMode === "run") {
    if (!target || !isNumeric(target)) {
      throw new CliError("Run target must be a numeric workflow run id.");
    }
    return Number(target);
  }
  if (target && targetMode === "auto" && isNumeric(target)) {
    if (target.length >= 7)
      return Number(target);
  }
  const pr = resolvePr(target, repo);
  const runs = ghJson([
    "run",
    "list",
    "--json",
    "databaseId,headSha,workflowName,status,conclusion,url",
    "--limit",
    "30",
    "--branch",
    pr.headRefName
  ], { repo: repo.fullName });
  if (runs.length === 0) {
    throw new CliError("No workflow runs found for this target.");
  }
  const sameSha = runs.find((run) => run.headSha === pr.headRefOid);
  return (sameSha || runs[0]).databaseId;
}
function getRunSummary(repo, runId) {
  const run = ghJson(["run", "view", String(runId), "--json", "databaseId,workflowName,status,conclusion,url"], { repo: repo.fullName });
  const jobs = listRunJobs(repo, runId);
  return {
    databaseId: run.databaseId,
    workflowName: run.workflowName,
    status: run.status,
    conclusion: run.conclusion,
    url: run.url,
    jobs: jobs.map((job) => ({
      databaseId: job.id,
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      startedAt: job.started_at,
      completedAt: job.completed_at
    }))
  };
}
function getRunLogs(repo, runId, failedOnly, jobId, tail = 200) {
  const args = ["run", "view", String(runId)];
  if (jobId) {
    args.push("--job", String(jobId), "--log");
  } else {
    args.push(failedOnly ? "--log-failed" : "--log");
  }
  const raw = ghExec(args, { repo: repo.fullName });
  const lines = raw.split(`
`);
  return lines.slice(Math.max(0, lines.length - tail)).join(`
`);
}
function getAnnotations(repo, runId, failedOnly) {
  const jobs = listRunJobs(repo, runId);
  const selected = failedOnly ? jobs.filter((j) => j.conclusion === "failure") : jobs;
  const annotations = [];
  for (const job of selected) {
    const checkRunId = parseCheckRunId(job.check_run_url);
    if (!checkRunId)
      continue;
    const jobAnnotations = listAnnotationsForCheckRun(repo, checkRunId);
    annotations.push(...jobAnnotations);
  }
  return annotations;
}
function rerunRun(repo, runId, options) {
  if (options.failedOnly && options.jobId) {
    throw new CliError("Use either --failed or --job, not both");
  }
  const args = ["run", "rerun", String(runId)];
  let mode = "run";
  if (options.failedOnly) {
    args.push("--failed");
    mode = "failed";
  }
  if (options.jobId) {
    args.push("--job", String(options.jobId));
    mode = "job";
  }
  if (options.debug) {
    args.push("--debug");
  }
  ghExec(args, { repo: repo.fullName });
  return {
    schemaVersion: 1,
    repo: repo.fullName,
    action: "rerun",
    runId,
    mode,
    jobId: options.jobId,
    debug: options.debug || undefined,
    command: `gh ${args.join(" ")} --repo ${repo.fullName}`,
    requested: true
  };
}
function cancelRun(repo, runId, force) {
  const args = ["run", "cancel", String(runId)];
  if (force)
    args.push("--force");
  ghExec(args, { repo: repo.fullName });
  return {
    schemaVersion: 1,
    repo: repo.fullName,
    action: "cancel",
    runId,
    mode: "run",
    force: force || undefined,
    command: `gh ${args.join(" ")} --repo ${repo.fullName}`,
    requested: true
  };
}

// src/github/graphql.ts
function queryGraphql(query, vars, repo) {
  const args = ["api", "graphql", "-f", `query=${query}`];
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined || value === null)
      continue;
    args.push("-F", `${key}=${String(value)}`);
  }
  return ghJson(args, { repo });
}

// src/services/thread-service.ts
var THREADS_QUERY = `
query($owner: String!, $name: String!, $number: Int!, $after: String) {
  repository(owner: $owner, name: $name) {
    pullRequest(number: $number) {
      reviewThreads(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(last: 1) {
            nodes {
              body
              updatedAt
              url
              author { login }
            }
          }
        }
      }
    }
  }
}
`;
var RESOLVE_MUTATION = `
mutation($threadId: ID!) {
  resolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}
`;
var UNRESOLVE_MUTATION = `
mutation($threadId: ID!) {
  unresolveReviewThread(input: {threadId: $threadId}) {
    thread { id isResolved }
  }
}
`;
function getThreads(repo, prNumber, unresolvedOnly) {
  const mapped = [];
  let after = null;
  while (true) {
    const res = queryGraphql(THREADS_QUERY, {
      owner: repo.owner,
      name: repo.name,
      number: prNumber,
      after
    }, repo.fullName);
    const connection = res.data.repository.pullRequest.reviewThreads;
    mapped.push(...connection.nodes.map((node) => {
      const latest = node.comments.nodes[0];
      return {
        id: node.id,
        isResolved: node.isResolved,
        isOutdated: node.isOutdated,
        path: node.path,
        line: node.line,
        latestAuthor: latest?.author?.login || "unknown",
        latestBody: latest?.body || "",
        latestUpdatedAt: latest?.updatedAt || "",
        latestUrl: latest?.url || ""
      };
    }));
    if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor) {
      break;
    }
    after = connection.pageInfo.endCursor;
  }
  return unresolvedOnly ? mapped.filter((t) => !t.isResolved) : mapped;
}
function resolveThread(repo, threadId) {
  const res = queryGraphql(RESOLVE_MUTATION, { threadId }, repo.fullName);
  return res.data.resolveReviewThread.thread;
}
function unresolveThread(repo, threadId) {
  const res = queryGraphql(UNRESOLVE_MUTATION, { threadId }, repo.fullName);
  return res.data.unresolveReviewThread.thread;
}

// src/services/context-service.ts
function commandForAction(action, repo, prNumber, runId) {
  if (action === "fix_ci") {
    if (runId)
      return `gh prx ci logs ${runId} --failed --repo ${repo.fullName}`;
    return `gh prx ci status ${prNumber} --repo ${repo.fullName}`;
  }
  if (action === "wait_for_ci") {
    if (runId)
      return `gh prx ci watch ${runId} --fail-fast --format jsonl --repo ${repo.fullName}`;
    return `gh prx ci status ${prNumber} --repo ${repo.fullName}`;
  }
  if (action === "address_review" || action === "address_changes_requested") {
    return `gh prx threads list ${prNumber} --unresolved --repo ${repo.fullName}`;
  }
  if (action === "wait_for_review") {
    return `gh prx context ${prNumber} --repo ${repo.fullName}`;
  }
  if (action === "mark_ready") {
    return `gh pr view ${prNumber} --repo ${repo.fullName}`;
  }
  return `gh prx context ${prNumber} --repo ${repo.fullName}`;
}
function buildContext(repo, target) {
  const pr = resolvePr(target, repo);
  const checks = listChecks(pr.number, repo);
  const threads = getThreads(repo, pr.number, true);
  let run = null;
  try {
    const runId = resolveRunId(repo, String(pr.number), "pr");
    run = getRunSummary(repo, runId);
  } catch {
    run = null;
  }
  const failingChecks = checks.filter((check) => check.bucket === "fail" || check.state === "FAILURE");
  const pendingChecks = checks.filter((check) => check.bucket === "pending" || ["PENDING", "IN_PROGRESS", "QUEUED"].includes(check.state));
  const failedJobs = run ? run.jobs.filter((job) => job.conclusion === "failure") : [];
  let suggestedNextAction = "ready_to_merge";
  if (failedJobs.length > 0 || failingChecks.length > 0)
    suggestedNextAction = "fix_ci";
  else if (pendingChecks.length > 0)
    suggestedNextAction = "wait_for_ci";
  else if (pr.reviewDecision === "CHANGES_REQUESTED")
    suggestedNextAction = "address_changes_requested";
  else if (threads.length > 0)
    suggestedNextAction = "address_review";
  else if (pr.reviewDecision === "REVIEW_REQUIRED" || (pr.reviewRequestsCount || 0) > 0)
    suggestedNextAction = "wait_for_review";
  else if (pr.isDraft)
    suggestedNextAction = "mark_ready";
  return {
    schemaVersion: 1,
    repo: repo.fullName,
    pr,
    unresolvedThreads: threads,
    checks,
    latestRun: run,
    failingChecks,
    failedJobs,
    pendingChecks,
    suggestedNextAction,
    suggestedNextCommand: commandForAction(suggestedNextAction, repo, pr.number, run?.databaseId)
  };
}

// src/services/diagnose-service.ts
function groupAnnotationsByPath(annotations) {
  const byPath = new Map;
  for (const annotation of annotations) {
    const path = annotation.path || "<unknown>";
    const existing = byPath.get(path);
    if (existing) {
      existing.count += 1;
      existing.annotations.push(annotation);
      existing.levels[annotation.annotation_level] = (existing.levels[annotation.annotation_level] || 0) + 1;
      continue;
    }
    byPath.set(path, {
      path,
      count: 1,
      levels: {
        [annotation.annotation_level]: 1
      },
      annotations: [annotation]
    });
  }
  return [...byPath.values()].sort((a, b) => {
    if (b.count !== a.count)
      return b.count - a.count;
    return a.path.localeCompare(b.path);
  });
}
function diagnoseCi(repo, options) {
  const mode = options.targetMode || "auto";
  const runId = resolveRunId(repo, options.target, mode);
  const run = getRunSummary(repo, runId);
  const failingJobs = run.jobs.filter((job) => job.conclusion === "failure");
  const selectedJobs = failingJobs.slice(0, Math.max(1, options.maxJobs));
  const logsByJob = selectedJobs.map((job) => ({
    jobId: job.databaseId,
    jobName: job.name,
    tailLines: options.tail,
    logTail: getRunLogs(repo, runId, true, job.databaseId, options.tail)
  }));
  const annotations = getAnnotations(repo, runId, true);
  const annotationsByPath = groupAnnotationsByPath(annotations);
  const suggestedNextAction = failingJobs.length > 0 ? "fix_first_failing_job" : run.conclusion === "success" ? "no_failures_detected" : "inspect_run_status";
  const suggestedNextCommand = failingJobs.length > 0 ? `gh prx ci logs ${runId} --job ${failingJobs[0].databaseId} --failed --repo ${repo.fullName}` : `gh prx ci status ${runId} --repo ${repo.fullName}`;
  return {
    schemaVersion: 1,
    repo: repo.fullName,
    run,
    failingJobs,
    logsByJob,
    annotationsCount: annotations.length,
    annotationsByPath,
    suggestedNextAction,
    suggestedNextCommand
  };
}

// src/services/doctor-service.ts
function runDoctor(repo, target) {
  const context = buildContext(repo, target);
  const diagnostics = [];
  if (context.failedJobs.length > 0 || context.failingChecks.length > 0) {
    diagnostics.push({
      severity: "error",
      code: "REQUIRED_CHECK_FAILED",
      message: "One or more CI checks failed.",
      nextAction: "Run `gh prx ci logs --failed` and fix the first failing job.",
      command: `gh prx ci logs ${context.latestRun?.databaseId ?? context.pr.number} --failed --repo ${repo.fullName}`
    });
  }
  if (context.pendingChecks.length > 0) {
    diagnostics.push({
      severity: "warn",
      code: "REQUIRED_CHECK_PENDING",
      message: `${context.pendingChecks.length} check(s) are still pending.`,
      nextAction: "Watch CI until completion.",
      command: `gh prx ci watch ${context.latestRun?.databaseId ?? context.pr.number} --fail-fast --repo ${repo.fullName}`
    });
  }
  if (context.unresolvedThreads.length > 0) {
    diagnostics.push({
      severity: "error",
      code: "UNRESOLVED_THREADS",
      message: `${context.unresolvedThreads.length} unresolved review thread(s).`,
      nextAction: "Run `gh prx threads list --unresolved` and address each thread.",
      command: `gh prx threads list ${context.pr.number} --unresolved --repo ${repo.fullName}`
    });
  }
  if (context.pr.reviewDecision === "CHANGES_REQUESTED") {
    diagnostics.push({
      severity: "error",
      code: "CHANGES_REQUESTED",
      message: "Reviewers requested changes.",
      nextAction: "Address the requested changes and push updates.",
      command: `gh prx threads list ${context.pr.number} --unresolved --repo ${repo.fullName}`
    });
  }
  if (context.pr.reviewDecision === "REVIEW_REQUIRED") {
    diagnostics.push({
      severity: "warn",
      code: "REVIEW_REQUIRED",
      message: "PR still needs reviewer approval.",
      nextAction: "Request review or wait for approvals.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`
    });
  }
  if ((context.pr.reviewRequestsCount || 0) > 0) {
    diagnostics.push({
      severity: "warn",
      code: "REVIEW_REQUESTS_PENDING",
      message: `${context.pr.reviewRequestsCount} review request(s) are still open.`,
      nextAction: "Wait for reviewers or re-request review when ready.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`
    });
  }
  if (context.pr.isDraft) {
    diagnostics.push({
      severity: "warn",
      code: "PR_DRAFT",
      message: "Pull request is still in draft state.",
      nextAction: "Mark PR ready when CI and review comments are clean.",
      command: `gh pr view ${context.pr.number} --repo ${repo.fullName}`
    });
  }
  if (context.pr.mergeStateStatus && ["DIRTY", "BEHIND"].includes(context.pr.mergeStateStatus)) {
    diagnostics.push({
      severity: "warn",
      code: "NEEDS_REBASE",
      message: `Merge state is ${context.pr.mergeStateStatus}.`,
      nextAction: "Rebase or update your branch from base branch.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`
    });
  }
  if (diagnostics.length === 0) {
    diagnostics.push({
      severity: "info",
      code: "ALL_CLEAR",
      message: "No blockers detected.",
      nextAction: "Proceed to merge or request final review.",
      command: `gh prx context ${context.pr.number} --repo ${repo.fullName}`
    });
  }
  return { diagnostics, context };
}

// src/services/next-service.ts
function repoArg(repo) {
  return `--repo ${repo.fullName}`;
}
function getNextStep(repo, target) {
  const context = buildContext(repo, target);
  const base = {
    schemaVersion: 1,
    repo: repo.fullName,
    pr: context.pr.number
  };
  if (context.failedJobs.length > 0) {
    const job = context.failedJobs[0];
    const runId = context.latestRun?.databaseId || context.pr.number;
    return {
      ...base,
      kind: "ci_failure",
      reason: `Failing CI job: ${job.name}`,
      command: `gh prx ci logs ${runId} --job ${job.databaseId} --failed ${repoArg(repo)}`,
      details: {
        runId,
        jobId: job.databaseId,
        jobName: job.name
      }
    };
  }
  if (context.pendingChecks.length > 0) {
    const runId = context.latestRun?.databaseId || context.pr.number;
    return {
      ...base,
      kind: "ci_pending",
      reason: `${context.pendingChecks.length} check(s) still pending`,
      command: `gh prx ci watch ${runId} --fail-fast --format jsonl ${repoArg(repo)}`,
      details: {
        runId,
        pendingChecks: context.pendingChecks.map((check) => check.name)
      }
    };
  }
  if (context.pr.reviewDecision === "CHANGES_REQUESTED") {
    return {
      ...base,
      kind: "changes_requested",
      reason: "Reviewers requested changes",
      command: `gh prx threads list ${context.pr.number} --unresolved ${repoArg(repo)} --format json`,
      details: {
        unresolvedCount: context.unresolvedThreads.length
      }
    };
  }
  if (context.unresolvedThreads.length > 0) {
    const thread = context.unresolvedThreads[0];
    return {
      ...base,
      kind: "unresolved_thread",
      reason: `Open thread in ${thread.path}:${thread.line ?? "-"}`,
      command: `gh prx threads list ${context.pr.number} --unresolved ${repoArg(repo)} --format json`,
      details: {
        threadId: thread.id,
        path: thread.path,
        line: thread.line,
        url: thread.latestUrl
      }
    };
  }
  if (context.pr.reviewDecision === "REVIEW_REQUIRED" || (context.pr.reviewRequestsCount || 0) > 0) {
    return {
      ...base,
      kind: "waiting_review",
      reason: "Waiting for reviewer approval",
      command: `gh prx context ${context.pr.number} ${repoArg(repo)} --format json`,
      details: {
        reviewDecision: context.pr.reviewDecision || null,
        reviewRequestsCount: context.pr.reviewRequestsCount || 0
      }
    };
  }
  if (context.pr.isDraft) {
    return {
      ...base,
      kind: "draft",
      reason: "PR is draft",
      command: `gh pr view ${context.pr.number} ${repoArg(repo)}`,
      details: {
        draft: true
      }
    };
  }
  return {
    ...base,
    kind: "ready_to_merge",
    reason: "No blockers detected",
    command: `gh prx context ${context.pr.number} ${repoArg(repo)} --format json`,
    details: {
      reviewDecision: context.pr.reviewDecision || null,
      mergeStateStatus: context.pr.mergeStateStatus || null
    }
  };
}

// src/services/watch-service.ts
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function summarizeRun(run) {
  const failedJobs = run.jobs.filter((job) => job.conclusion === "failure");
  const pendingJobs = run.jobs.filter((job) => !job.conclusion);
  return {
    runId: run.databaseId,
    status: run.status,
    conclusion: run.conclusion,
    failedJobs: failedJobs.map((job) => ({ id: job.databaseId, name: job.name })),
    pendingCount: pendingJobs.length,
    url: run.url
  };
}
function printEvent(format, event) {
  if (format === "jsonl") {
    process.stdout.write(`${JSON.stringify(event)}
`);
    return;
  }
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(event, null, 2)}
`);
    return;
  }
  const summary = event.summary;
  process.stdout.write(`[${event.type}] run=${summary.runId} status=${summary.status} conclusion=${summary.conclusion ?? "-"} failed=${summary.failedJobs.length} pending=${summary.pendingCount}
`);
}
async function watchCi(repo, options) {
  const runId = resolveRunId(repo, options.target, options.targetMode || "auto");
  const start = Date.now();
  let lastState = "";
  while (true) {
    if ((Date.now() - start) / 1000 > options.timeoutSec) {
      printEvent(options.format, {
        type: "timeout",
        summary: {
          runId,
          status: "timeout",
          conclusion: null,
          failedJobs: [],
          pendingCount: 0,
          url: ""
        }
      });
      return 124;
    }
    const run = getRunSummary(repo, runId);
    const summary = summarizeRun(run);
    const state = `${summary.status}:${summary.conclusion}:${summary.failedJobs.length}:${summary.pendingCount}`;
    if (state !== lastState) {
      printEvent(options.format, { type: "update", summary });
      lastState = state;
    }
    const hasFailure = summary.failedJobs.length > 0;
    const isComplete = ["completed", "success", "failure", "cancelled"].includes(summary.status) || summary.conclusion !== null;
    if (options.failFast && hasFailure) {
      printEvent(options.format, { type: "fail_fast", summary });
      return 1;
    }
    if (isComplete) {
      if (summary.conclusion === "success") {
        printEvent(options.format, { type: "finished", summary });
        return 0;
      }
      printEvent(options.format, { type: "finished", summary });
      return 1;
    }
    await sleep(options.intervalSec * 1000);
  }
}

// src/util/output.ts
function printResult(format, data, textRenderer) {
  if (format === "json") {
    process.stdout.write(`${JSON.stringify(data, null, 2)}
`);
    return;
  }
  if (format === "jsonl") {
    if (Array.isArray(data)) {
      for (const item of data)
        process.stdout.write(`${JSON.stringify(item)}
`);
      return;
    }
    if (typeof data === "object" && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        process.stdout.write(`${JSON.stringify({ type: key, value })}
`);
      }
      return;
    }
    process.stdout.write(`${JSON.stringify({ value: data })}
`);
    return;
  }
  process.stdout.write(`${textRenderer()}
`);
}

// src/util/repo.ts
function inferRepo(override) {
  const fullName = override || ghExec(["repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"]);
  if (!fullName.includes("/")) {
    throw new CliError("Could not infer repository. Pass --repo owner/name.");
  }
  const [owner, name] = fullName.split("/");
  return {
    host: "github.com",
    owner,
    name,
    fullName
  };
}

// src/util/state.ts
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
function stateFilePath() {
  if (process.env.GH_PRX_STATE_FILE)
    return process.env.GH_PRX_STATE_FILE;
  const configHome = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
  return join(configHome, "gh-prx", "state.json");
}
function loadState() {
  const path = stateFilePath();
  if (!existsSync(path)) {
    return { schemaVersion: 1 };
  }
  try {
    const raw = readFileSync(path, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object")
      return { schemaVersion: 1 };
    return {
      schemaVersion: 1,
      stickyContext: parsed.stickyContext
    };
  } catch {
    return { schemaVersion: 1 };
  }
}
function saveState(state) {
  const path = stateFilePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(state, null, 2)}
`, "utf8");
}
function getStickyContext() {
  const state = loadState();
  if (!state.stickyContext)
    return null;
  return state.stickyContext;
}
function setStickyContext(context) {
  const value = {
    repo: context.repo,
    target: context.target,
    updatedAt: new Date().toISOString()
  };
  saveState({ schemaVersion: 1, stickyContext: value });
  return value;
}
function clearStickyContext() {
  const path = stateFilePath();
  if (existsSync(path))
    unlinkSync(path);
}

// src/util/target.ts
function isNumeric2(value) {
  return /^\d+$/.test(value);
}
function nonEmpty(value, label) {
  const trimmed = value.trim();
  if (!trimmed)
    throw new CliError(`${label} cannot be empty`);
  return trimmed;
}
function ensureRunId(value, source) {
  const normalized = nonEmpty(value, source);
  if (!isNumeric2(normalized)) {
    throw new CliError(`${source} must be a numeric workflow run id`);
  }
  return normalized;
}
function parseTarget(options) {
  if (options.pr && options.run) {
    throw new CliError("Use either --pr or --run, not both");
  }
  if (options.pr) {
    return { kind: "pr", value: nonEmpty(options.pr, "--pr") };
  }
  if (options.run) {
    return { kind: "run", value: ensureRunId(options.run, "--run") };
  }
  const raw = options.target?.trim();
  if (!raw)
    return { kind: "none" };
  if (raw.startsWith("pr:")) {
    return { kind: "pr", value: nonEmpty(raw.slice(3), "pr target") };
  }
  if (raw.startsWith("run:")) {
    return { kind: "run", value: ensureRunId(raw.slice(4), "run target") };
  }
  return { kind: "auto", value: raw };
}
function isRunLikeAutoTarget(value) {
  if (!value)
    return false;
  return isNumeric2(value) && value.length >= 7;
}
function targetToServiceInput(parsed) {
  if (parsed.kind === "none")
    return { target: undefined, mode: "auto" };
  if (parsed.kind === "pr")
    return { target: parsed.value, mode: "pr" };
  if (parsed.kind === "run")
    return { target: parsed.value, mode: "run" };
  return { target: parsed.value, mode: "auto" };
}
function requirePrTarget(parsed, commandName) {
  if (parsed.kind === "run") {
    throw new CliError(`${commandName} does not accept run targets. Use --pr or pr:<target>.`);
  }
  if (parsed.kind === "none")
    return;
  return parsed.value;
}
function toStoredTarget(parsed) {
  if (parsed.kind === "none")
    return null;
  if (parsed.kind === "run")
    return `run:${parsed.value}`;
  if (parsed.kind === "pr")
    return `pr:${parsed.value}`;
  return `pr:${parsed.value}`;
}

// src/cli/index.ts
function resolveCliVersion() {
  if ("0.1.3".trim()) {
    return "0.1.3";
  }
  const here = dirname2(fileURLToPath(import.meta.url));
  const candidates = [resolve(here, "../package.json"), resolve(here, "../../package.json")];
  for (const candidate of candidates) {
    if (!existsSync2(candidate))
      continue;
    try {
      const raw = readFileSync2(candidate, "utf8");
      const parsed = JSON.parse(raw);
      if (typeof parsed.version === "string" && parsed.version.trim()) {
        return parsed.version;
      }
    } catch {
      continue;
    }
  }
  return "0.0.0";
}
var cliVersion = resolveCliVersion();
if (process.argv.includes("--no-color") || process.argv.includes("--noColor") || process.argv.includes("--agent")) {
  setColorEnabled(false);
}
function parseFormat(value, agentMode = false, agentDefault = "json") {
  if (!value)
    return agentMode ? agentDefault : "text";
  if (value === "text" || value === "json" || value === "jsonl")
    return value;
  throw new CliError("--format must be text|json|jsonl");
}
function applyColorOption(options) {
  setColorEnabled(isColorEnabled(Boolean(options.noColor || options.agent)));
}
function addTargetOptions(cmd) {
  return cmd.option("--pr [target]", "Treat target as PR number/url/branch").option("--run [id]", "Treat target as workflow run id");
}
function addCommonOptions(cmd) {
  return cmd.option("--format [format]", "Output format: text|json|jsonl (default: text)").option("--repo [repo]", "Target repository in owner/name format").option("--agent", "Agent mode: defaults to json + no color + smart flags").option("--no-color", "Disable colored output (also honors NO_COLOR env)");
}
function resolveRepoAndTarget(target, options) {
  let parsedTarget = parseTarget({
    target,
    pr: options.pr,
    run: options.run
  });
  const sticky = getStickyContext();
  if (parsedTarget.kind === "none" && sticky?.target) {
    parsedTarget = parseTarget({ target: sticky.target });
  }
  const repoOverride = options.repo || sticky?.repo;
  const repo = inferRepo(repoOverride);
  return { repo, parsedTarget };
}
function withErrorHandling(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      if (error instanceof CliError) {
        process.stderr.write(`${c().red("error:")} ${error.message}
`);
        process.exit(error.exitCode);
      }
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${c().red("error:")} ${message}
`);
      process.exit(1);
    }
  };
}
var cli = dist_default("gh prx").usage("<command> [options]").version(cliVersion).example("gh prx context").example("gh prx threads list --unresolved").example("gh prx ci watch --fail-fast --format jsonl").example("gh prx doctor").help((sections) => {
  const colors2 = c();
  return sections.map((section) => {
    if (!section.title)
      return section;
    return {
      ...section,
      title: colors2.bold(colors2.cyan(section.title))
    };
  });
});
addCommonOptions(addTargetOptions(cli.command("context [target]", "Unified PR + CI snapshot").example("gh prx context").example("gh prx context 123").example("gh prx context docs/my-branch --repo cli/cli").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const prTarget = requirePrTarget(parsedTarget, "context");
  const context = buildContext(repo, prTarget);
  printResult(format, context, () => {
    const colors2 = c();
    return [
      `${colors2.bold(context.repo)} PR #${context.pr.number}: ${context.pr.title}`,
      `${colors2.bold("Suggested next action:")} ${colors2.cyan(context.suggestedNextAction)}`,
      `${colors2.bold("Suggested command:")} ${colors2.cyan(context.suggestedNextCommand)}`,
      `${colors2.bold("Unresolved threads:")} ${context.unresolvedThreads.length}`,
      renderChecks(context.checks),
      context.latestRun ? renderRun(context.latestRun) : "No workflow run found for this PR."
    ].join(`

`);
  });
}))));
addCommonOptions(addTargetOptions(cli.command("threads list [target]", "List review threads").option("--unresolved", "Show unresolved threads only").example("gh prx threads list").example("gh prx threads list 123 --unresolved").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const prTarget = requirePrTarget(parsedTarget, "threads list");
  const unresolvedOnly = Boolean(options.unresolved || options.agent);
  const pr = resolvePr(prTarget, repo);
  const threads = getThreads(repo, pr.number, unresolvedOnly);
  printResult(format, { pr: pr.number, threads }, () => renderThreads(threads));
}))));
addCommonOptions(cli.command("threads resolve <threadId>", "Resolve a review thread").example("gh prx threads resolve PRRT_kwDOabc").action(withErrorHandling((threadId, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const repo = inferRepo(options.repo);
  const result = resolveThread(repo, threadId);
  printResult(format, result, () => `Thread ${result.id} resolved=${result.isResolved}`);
})));
addCommonOptions(cli.command("threads unresolve <threadId>", "Unresolve a review thread").example("gh prx threads unresolve PRRT_kwDOabc").action(withErrorHandling((threadId, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const repo = inferRepo(options.repo);
  const result = unresolveThread(repo, threadId);
  printResult(format, result, () => `Thread ${result.id} resolved=${result.isResolved}`);
})));
addCommonOptions(addTargetOptions(cli.command("ci status [target]", "Show CI status and latest run jobs").example("gh prx ci status").example("gh prx ci status 123").example("gh prx ci status run:22305316388").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const serviceTarget = targetToServiceInput(parsedTarget);
  const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
  const run = getRunSummary(repo, runId);
  let checks = [];
  const shouldLoadChecks = parsedTarget.kind === "none" || parsedTarget.kind === "pr" || parsedTarget.kind === "auto" && !isRunLikeAutoTarget(parsedTarget.value);
  if (shouldLoadChecks) {
    const prTarget = parsedTarget.kind === "none" ? undefined : parsedTarget.value;
    const pr = resolvePr(prTarget, repo);
    checks = listChecks(pr.number, repo);
  }
  printResult(format, { run, checks }, () => {
    const checksBlock = checks.length > 0 ? renderChecks(checks) : "";
    return [renderRun(run), checksBlock].filter(Boolean).join(`

`);
  });
}))));
addCommonOptions(addTargetOptions(cli.command("ci logs [target]", "Show workflow logs").option("--failed", "Show only failed log sections").option("--job [id]", "Specific job ID").option("--tail [n]", "Tail size in lines (default: 200)").example("gh prx ci logs --failed").example("gh prx ci logs run:22305316388 --job 61631229417 --tail 300").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const serviceTarget = targetToServiceInput(parsedTarget);
  const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
  const tailSize = Number(options.tail || "200");
  if (!Number.isFinite(tailSize) || tailSize <= 0) {
    throw new CliError("--tail must be a positive number");
  }
  const jobId = options.job ? Number(options.job) : undefined;
  if (options.job && (!Number.isFinite(jobId) || (jobId || 0) <= 0)) {
    throw new CliError("--job must be a numeric job id");
  }
  const failedOnly = Boolean(options.failed || options.agent);
  const logs = getRunLogs(repo, runId, failedOnly, jobId, tailSize);
  printResult(format, { runId, failedOnly, jobId, logs }, () => logs);
}))));
addCommonOptions(addTargetOptions(cli.command("ci annotations [target]", "Show check-run annotations").option("--failed", "Only annotations from failed jobs").example("gh prx ci annotations --failed").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const serviceTarget = targetToServiceInput(parsedTarget);
  const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
  const failedOnly = Boolean(options.failed || options.agent);
  const annotations = getAnnotations(repo, runId, failedOnly);
  printResult(format, { runId, failedOnly, annotations }, () => renderAnnotations(annotations));
}))));
addCommonOptions(addTargetOptions(cli.command("ci rerun [target]", "Rerun a workflow run, failed jobs, or a specific job").option("--failed", "Rerun only failed jobs").option("--job [id]", "Rerun one job by database job id").option("--debug", "Enable Actions debug logging for rerun").example("gh prx ci rerun").example("gh prx ci rerun --failed").example("gh prx ci rerun run:22305316388 --job 61631229417").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const serviceTarget = targetToServiceInput(parsedTarget);
  const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
  const jobId = options.job ? Number(options.job) : undefined;
  if (options.job && (!Number.isFinite(jobId) || (jobId || 0) <= 0)) {
    throw new CliError("--job must be a numeric job id");
  }
  const result = rerunRun(repo, runId, {
    failedOnly: Boolean(options.failed),
    jobId,
    debug: Boolean(options.debug)
  });
  printResult(format, result, () => renderCiMutation(result));
}))));
addCommonOptions(addTargetOptions(cli.command("ci cancel [target]", "Cancel a workflow run").option("--force", "Force cancel a workflow run").example("gh prx ci cancel").example("gh prx ci cancel run:22305316388").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const serviceTarget = targetToServiceInput(parsedTarget);
  const runId = resolveRunId(repo, serviceTarget.target, serviceTarget.mode);
  const result = cancelRun(repo, runId, Boolean(options.force));
  printResult(format, result, () => renderCiMutation(result));
}))));
addCommonOptions(addTargetOptions(cli.command("ci diagnose [target]", "Diagnose failing jobs with logs and annotations").option("--tail [n]", "Tail size in lines per failing job (default: 200)").option("--max-jobs [n]", "Maximum failing jobs to include (default: 3)").example("gh prx ci diagnose").example("gh prx ci diagnose run:22305316388 --tail 300 --max-jobs 2").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const serviceTarget = targetToServiceInput(parsedTarget);
  const tail = Number(options.tail || "200");
  const maxJobs = Number(options.maxJobs || "3");
  if (!Number.isFinite(tail) || tail <= 0) {
    throw new CliError("--tail must be a positive number");
  }
  if (!Number.isFinite(maxJobs) || maxJobs <= 0) {
    throw new CliError("--max-jobs must be a positive number");
  }
  const diagnosis = diagnoseCi(repo, {
    target: serviceTarget.target,
    targetMode: serviceTarget.mode,
    tail,
    maxJobs
  });
  printResult(format, diagnosis, () => renderCiDiagnosis(diagnosis));
}))));
addCommonOptions(addTargetOptions(cli.command("ci watch [target]", "Watch CI run progress").option("--fail-fast", "Exit immediately on first failure").option("--interval [sec]", "Refresh interval seconds (default: 10)").option("--timeout [sec]", "Timeout in seconds (default: 1800)").example("gh prx ci watch --fail-fast").example("gh prx ci watch --interval 5 --timeout 1200 --format jsonl").action(withErrorHandling(async (target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent), "jsonl");
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const serviceTarget = targetToServiceInput(parsedTarget);
  const intervalSec = Number(options.interval || "10");
  const timeoutSec = Number(options.timeout || "1800");
  if (!Number.isFinite(intervalSec) || intervalSec <= 0) {
    throw new CliError("--interval must be a positive number");
  }
  if (!Number.isFinite(timeoutSec) || timeoutSec <= 0) {
    throw new CliError("--timeout must be a positive number");
  }
  const exitCode = await watchCi(repo, {
    target: serviceTarget.target,
    targetMode: serviceTarget.mode,
    failFast: Boolean(options.failFast || options.agent),
    intervalSec,
    timeoutSec,
    format
  });
  process.exit(exitCode);
}))));
addCommonOptions(addTargetOptions(cli.command("next [target]", "Return one actionable next step").example("gh prx next").example("gh prx next pr:123 --format json").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const prTarget = requirePrTarget(parsedTarget, "next");
  const next = getNextStep(repo, prTarget);
  printResult(format, next, () => renderNextStep(next));
}))));
addCommonOptions(addTargetOptions(cli.command("doctor [target]", "Diagnose PR blockers").example("gh prx doctor").example("gh prx doctor 123 --format json").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  const { repo, parsedTarget } = resolveRepoAndTarget(target, options);
  const prTarget = requirePrTarget(parsedTarget, "doctor");
  const result = runDoctor(repo, prTarget);
  printResult(format, result, () => {
    const colors2 = c();
    return [
      `${colors2.bold(result.context.repo)} PR #${result.context.pr.number}`,
      ...result.diagnostics.map((diagnostic) => {
        const level = diagnostic.severity === "error" ? colors2.red(diagnostic.severity) : diagnostic.severity === "warn" ? colors2.yellow(diagnostic.severity) : colors2.cyan(diagnostic.severity);
        const command = diagnostic.command ? ` (${colors2.cyan(diagnostic.command)})` : "";
        return `- [${level}] ${diagnostic.code}: ${diagnostic.message} -> ${diagnostic.nextAction}${command}`;
      })
    ].join(`
`);
  });
}))));
addCommonOptions(addTargetOptions(cli.command("use [target]", "Show or persist sticky repo/target context").option("--clear", "Clear sticky context").example("gh prx use").example("gh prx use 123 --repo owner/repo").example("gh prx use run:22305316388 --repo owner/repo").example("gh prx use --clear").action(withErrorHandling((target, options) => {
  applyColorOption(options);
  const format = parseFormat(options.format, Boolean(options.agent));
  if (options.clear) {
    clearStickyContext();
    printResult(format, { stickyContext: null, cleared: true }, () => "Sticky context cleared.");
    return;
  }
  const parsedTarget = parseTarget({ target, pr: options.pr, run: options.run });
  if (parsedTarget.kind === "none") {
    const sticky = getStickyContext();
    printResult(format, { stickyContext: sticky }, () => sticky ? `Sticky context: ${sticky.repo} ${sticky.target} (updated ${sticky.updatedAt})` : "No sticky context set.");
    return;
  }
  const stickyTarget = toStoredTarget(parsedTarget);
  if (!stickyTarget) {
    throw new CliError("Could not determine sticky target");
  }
  const repo = inferRepo(options.repo);
  const saved = setStickyContext({
    repo: repo.fullName,
    target: stickyTarget
  });
  printResult(format, { stickyContext: saved }, () => `Sticky context set: ${saved.repo} ${saved.target}`);
}))));
try {
  cli.parse(process.argv, { run: false });
  await cli.runMatchedCommand();
} catch (error) {
  if (error instanceof CliError) {
    process.stderr.write(`${c().red("error:")} ${error.message}
`);
    process.exit(error.exitCode);
  }
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${c().red("error:")} ${message}
`);
  process.exit(1);
}

//# debugId=D3DED729CD36E30D64756E2164756E21
