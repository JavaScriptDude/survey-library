import { settings } from "../../src/mask/mask_utils";
import { getMaskedValueByPattern, getUnmaskedValueByPattern, getLiterals, InputMaskPattern } from "../../src/mask/mask_pattern";
import { QuestionTextModel } from "../../src/question_text";
import { JsonObject } from "../../src/jsonobject";

export default QUnit.module("Pattern mask");

const mask = "+9(999)-999-99-99";

QUnit.test("parsingMask simple pattern", function(assert) {
  let result = getLiterals(mask);
  assert.equal(result.length, 17);
  assert.equal(result[0].type, "const");
  assert.equal(result[0].value, "+");
  assert.equal(result[1].type, "regex");
  assert.equal(result[1].value, "9");
  assert.equal(result[2].type, "const");
  assert.equal(result[2].value, "(");
  assert.equal(result[3].type, "regex");
  assert.equal(result[3].value, "9");
});

QUnit.test("parsingMask with fixed character", function(assert) {
  let result = getLiterals("+\\9(999)-999-99-99");
  assert.equal(result.length, 17);
  assert.equal(result[0].type, "const");
  assert.equal(result[0].value, "+");
  assert.equal(result[1].type, "fixed");
  assert.equal(result[1].value, "9");
  assert.equal(result[2].type, "const");
  assert.equal(result[2].value, "(");
  assert.equal(result[3].type, "regex");
  assert.equal(result[3].value, "9");
});

QUnit.test("get masked valid text matchWholeMask = true", function(assert) {
  settings.placeholderChar = "*";
  assert.equal(getMaskedValueByPattern("", mask, true), "+*(***)-***-**-**");
  assert.equal(getMaskedValueByPattern("1", mask, true), "+1(***)-***-**-**");
  assert.equal(getMaskedValueByPattern("1234", mask, true), "+1(234)-***-**-**");
  assert.equal(getMaskedValueByPattern("1234567", mask, true), "+1(234)-567-**-**");
  assert.equal(getMaskedValueByPattern("12345678910", mask, true), "+1(234)-567-89-10");
  settings.placeholderChar = "_";
});

QUnit.test("get masked valid text matchWholeMask = false", function(assert) {
  settings.placeholderChar = "*";
  const customMask = "+1(999)-999-99-99";
  assert.equal(getMaskedValueByPattern("", customMask, false), "+1(");
  assert.equal(getMaskedValueByPattern("1", customMask, false), "+1(");
  assert.equal(getMaskedValueByPattern("8", customMask, false), "+1(8");
  assert.equal(getMaskedValueByPattern("+1", customMask, false), "+1(");
  assert.equal(getMaskedValueByPattern("+18", customMask, false), "+1(8");
  assert.equal(getMaskedValueByPattern("1234", customMask, false), "+1(234)-");
  assert.equal(getMaskedValueByPattern("123456", customMask, false), "+1(234)-56");
  assert.equal(getMaskedValueByPattern("123456789101", customMask, false), "+1(234)-567-89-10");
  settings.placeholderChar = "_";
});

QUnit.test("get masked valid text with fixed character", function(assert) {
  settings.placeholderChar = "*";
  const customMask = "+\\9(999)-999-99-99";
  assert.equal(getMaskedValueByPattern("", customMask, true), "+9(***)-***-**-**");
  assert.equal(getMaskedValueByPattern("9", customMask, true), "+9(***)-***-**-**");
  assert.equal(getMaskedValueByPattern("123", customMask, true), "+9(123)-***-**-**");
  assert.equal(getMaskedValueByPattern("9123", customMask, true), "+9(123)-***-**-**");
  assert.equal(getMaskedValueByPattern("1234567891", customMask, true), "+9(123)-456-78-91");
  assert.equal(getMaskedValueByPattern("9912", customMask, true), "+9(912)-***-**-**");
  settings.placeholderChar = "_";
});

QUnit.test("get masked valid text with fixed character in the middle string", function(assert) {
  settings.placeholderChar = "*";
  const customMask = "99+\\1(999)-999";
  assert.equal(getMaskedValueByPattern("", customMask, false), "");
  assert.equal(getMaskedValueByPattern("1", customMask, false), "1");
  assert.equal(getMaskedValueByPattern("12", customMask, false), "12+1(");
  assert.equal(getMaskedValueByPattern("123", customMask, false), "12+1(3");
  assert.equal(getMaskedValueByPattern("11123", customMask, false), "11+1(23");
  assert.equal(getMaskedValueByPattern("1234567891", customMask, false), "12+1(345)-678");
  assert.equal(getMaskedValueByPattern("111123", customMask, false), "11+1(123)-");
  settings.placeholderChar = "_";
});

QUnit.test("get masked invalid text", function(assert) {
  settings.placeholderChar = "*";
  const resultMaskedText = "+*(***)-***-**-**";
  assert.equal(getMaskedValueByPattern("", mask, true), resultMaskedText);
  assert.equal(getMaskedValueByPattern("a", mask, true), resultMaskedText);
  assert.equal(getMaskedValueByPattern("@", mask, true), resultMaskedText);
  assert.equal(getMaskedValueByPattern(".", mask, true), resultMaskedText);
  assert.equal(getMaskedValueByPattern("123456789101112", mask, true), "+1(234)-567-89-10");
  settings.placeholderChar = "_";
});

QUnit.test("get masked value by formated text matchWholeMask = true", function(assert) {
  settings.placeholderChar = "*";
  assert.equal(getMaskedValueByPattern("+1***)-***-**-**", mask, true), "+1(***)-***-**-**");
  assert.equal(getMaskedValueByPattern("+1(234)-1***-**-**", mask, true), "+1(234)-1**-**-**");
  assert.equal(getMaskedValueByPattern("+1(234)-1567-89-10", mask, true), "+1(234)-156-78-91");
  assert.equal(getMaskedValueByPattern("+1(234)-67-89-10", mask, true), "+1(234)-678-91-0*");
  assert.equal(getMaskedValueByPattern("+1(2367-89-10", mask, true), "+1(236)-789-10-**");
  settings.placeholderChar = "_";
});

QUnit.test("get masked value by formated text matchWholeMask = false", function(assert) {
  settings.placeholderChar = "*";
  const customMask = "+1(999)-999-99-99";
  assert.equal(getMaskedValueByPattern("", customMask, false), "+1(");
  assert.equal(getMaskedValueByPattern("+1(234)-1***-**-**", mask, false), "+1(234)-1");
  assert.equal(getMaskedValueByPattern("+1(234)-1567-89-10", mask, false), "+1(234)-156-78-91");
  assert.equal(getMaskedValueByPattern("+1(234)-67-89-10", mask, false), "+1(234)-678-91-0");
  assert.equal(getMaskedValueByPattern("+1(2367-89-10", mask, false), "+1(236)-789-10-");
  settings.placeholderChar = "_";
});

QUnit.test("get unmasked value, matchWholeMask is true", function(assert) {
  settings.placeholderChar = "*";
  assert.equal(getUnmaskedValueByPattern("", mask, true), "");
  assert.equal(getUnmaskedValueByPattern("+*(***)-***-**-**", mask, true), "");
  assert.equal(getUnmaskedValueByPattern("+1(234)-567-**-**", mask, true), "");
  assert.equal(getUnmaskedValueByPattern("+1(234)-567-89-10", mask, true), "12345678910");
  settings.placeholderChar = "_";
});

QUnit.test("get unmasked invalid value, matchWholeMask is true", function(assert) {
  settings.placeholderChar = "*";
  assert.equal(getUnmaskedValueByPattern("+.(***)-***-**-**", mask, true), "");
  assert.equal(getUnmaskedValueByPattern("+a(bcd)-567-**-**", mask, true), "");
  assert.equal(getUnmaskedValueByPattern("++(234)-567-89-10", mask, true), "");
  assert.equal(getUnmaskedValueByPattern("+1(234)-567-**-10", mask, true), "");
  settings.placeholderChar = "_";
});

QUnit.test("get unmasked value, matchWholeMask is false", function(assert) {
  settings.placeholderChar = "*";
  assert.equal(getUnmaskedValueByPattern("+*(***)-***-**-**", mask, false), "");
  assert.equal(getUnmaskedValueByPattern("+1(234)-567-**-**", mask, false), "1234567");
  assert.equal(getUnmaskedValueByPattern("+1(234)-567-89-10", mask, false), "12345678910");
  settings.placeholderChar = "_";
});

QUnit.test("get unmasked invalid value, matchWholeMask is false", function(assert) {
  settings.placeholderChar = "*";
  assert.equal(getUnmaskedValueByPattern("+.(***)-***-**-**", mask, false), "");
  assert.equal(getUnmaskedValueByPattern("+a(bcd)-567-**-**", mask, false), "");
  assert.equal(getUnmaskedValueByPattern("++(234)-567-89-10", mask, false), "");
  assert.equal(getUnmaskedValueByPattern("+1(234)-567-**-10", mask, false), "1234567");
  settings.placeholderChar = "_";
});

QUnit.test("pattern processInput: insert characters", function(assert) {
  settings.placeholderChar = "*";
  const maskInstance = new InputMaskPattern();
  maskInstance.mask = "+\\1(999)-999-99-99";
  let result = maskInstance.processInput({ insertedCharacters: "3", selectionStart: 3, selectionEnd: 3, prevValue: "+1(***)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(3**)-***-**-**", "type #1");
  assert.equal(result.cursorPosition, 4, "type #1");

  result = maskInstance.processInput({ insertedCharacters: "5", selectionStart: 5, selectionEnd: 5, prevValue: "+1(34*)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-***-**-**", "type #2.1");
  assert.equal(result.cursorPosition, 8, "type #2.1");

  result = maskInstance.processInput({ insertedCharacters: "6", selectionStart: 8, selectionEnd: 8, prevValue: "+1(345)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-6**-**-**", "type #2.2");
  assert.equal(result.cursorPosition, 9, "type #2.2");

  result = maskInstance.processInput({ insertedCharacters: "a", selectionStart: 8, selectionEnd: 8, prevValue: "+1(345)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-***-**-**", "type #3");
  assert.equal(result.cursorPosition, 8, "type #3");

  result = maskInstance.processInput({ insertedCharacters: "9", selectionStart: 8, selectionEnd: 8, prevValue: "+1(345)-678-10-11", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-967-81-01", "type #4");
  assert.equal(result.cursorPosition, 9, "type #4");

  result = maskInstance.processInput({ insertedCharacters: "a", selectionStart: 8, selectionEnd: 8, prevValue: "+1(345)-678-10-11", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-678-10-11", "type #5");
  assert.equal(result.cursorPosition, 8, "type #5");

  result = maskInstance.processInput({ insertedCharacters: "1", selectionStart: 17, selectionEnd: 17, prevValue: "+1(345)-678-10-11", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-678-10-11", "type #6");
  assert.equal(result.cursorPosition, 17, "type #6");

  result = maskInstance.processInput({ insertedCharacters: "5", selectionStart: 9, selectionEnd: 9, prevValue: "+1(123)-467-89-7*", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(123)-456-78-97", "type #7");
  assert.equal(result.cursorPosition, 10, "type #7");
  settings.placeholderChar = "_";
});

QUnit.test("pattern processInput: insert characters into beginning string", function(assert) {
  settings.placeholderChar = "*";
  const maskInstance = new InputMaskPattern();
  maskInstance.mask = "+\\1(999)-999-99-99";
  let result = maskInstance.processInput({ insertedCharacters: "1", selectionStart: 0, selectionEnd: 0, prevValue: "+1(***)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(***)-***-**-**", "type #1");
  assert.equal(result.cursorPosition, 3, "type #1");

  result = maskInstance.processInput({ insertedCharacters: "+", selectionStart: 0, selectionEnd: 0, prevValue: "+1(***)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(***)-***-**-**", "type #2");
  assert.equal(result.cursorPosition, 3, "type #2");

  result = maskInstance.processInput({ insertedCharacters: "a", selectionStart: 0, selectionEnd: 0, prevValue: "+1(***)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(***)-***-**-**", "type #3");
  assert.equal(result.cursorPosition, 3, "type #3");

  result = maskInstance.processInput({ insertedCharacters: "8", selectionStart: 0, selectionEnd: 0, prevValue: "+1(***)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(8**)-***-**-**", "type #4");
  assert.equal(result.cursorPosition, 4, "type #4");

  result = maskInstance.processInput({ insertedCharacters: "+18", selectionStart: 0, selectionEnd: 0, prevValue: "+1(***)-***-**-**", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(8**)-***-**-**", "type #5");
  assert.equal(result.cursorPosition, 4, "type #5");
  settings.placeholderChar = "_";
});

QUnit.test("pattern processInput: insert characters into middle string", function(assert) {
  settings.placeholderChar = "*";
  const maskInstance = new InputMaskPattern();
  maskInstance.mask = "99+\\1(999)-999";
  let result = maskInstance.processInput({ insertedCharacters: "1", selectionStart: 2, selectionEnd: 2, prevValue: "56+1(***)-***", inputDirection: "leftToRight" });
  assert.equal(result.text, "56+1(***)-***", "type #1");
  assert.equal(result.cursorPosition, 5, "type #1");

  result = maskInstance.processInput({ insertedCharacters: "+", selectionStart: 2, selectionEnd: 2, prevValue: "56+1(***)-***", inputDirection: "leftToRight" });
  assert.equal(result.text, "56+1(***)-***", "type #2");
  assert.equal(result.cursorPosition, 5, "type #2");

  result = maskInstance.processInput({ insertedCharacters: "a", selectionStart: 2, selectionEnd: 2, prevValue: "56+1(***)-***", inputDirection: "leftToRight" });
  assert.equal(result.text, "56+1(***)-***", "type #3");
  assert.equal(result.cursorPosition, 5, "type #3");

  result = maskInstance.processInput({ insertedCharacters: "8", selectionStart: 2, selectionEnd: 2, prevValue: "56+1(***)-***", inputDirection: "leftToRight" });
  assert.equal(result.text, "56+1(8**)-***", "type #4");
  assert.equal(result.cursorPosition, 6, "type #4");

  result = maskInstance.processInput({ insertedCharacters: "+18", selectionStart: 2, selectionEnd: 2, prevValue: "56+1(***)-***", inputDirection: "leftToRight" });
  assert.equal(result.text, "56+1(8**)-***", "type #5");
  assert.equal(result.cursorPosition, 6, "type #5");

  result = maskInstance.processInput({ insertedCharacters: "1", selectionStart: 0, selectionEnd: 0, prevValue: "**+1(***)-***", inputDirection: "leftToRight" });
  assert.equal(result.text, "1*+1(***)-***", "type #6");
  assert.equal(result.cursorPosition, 1, "type #6");

  result = maskInstance.processInput({ insertedCharacters: "9", selectionStart: 0, selectionEnd: 0, prevValue: "**+1(***)-***", inputDirection: "leftToRight" });
  assert.equal(result.text, "9*+1(***)-***", "type #7");
  assert.equal(result.cursorPosition, 1, "type #7");

  settings.placeholderChar = "_";
});

QUnit.test("pattern processInput: delete characters", function(assert) {
  settings.placeholderChar = "*";
  const maskInstance = new InputMaskPattern();
  maskInstance.mask = "+\\1(999)-999-99-99";
  let result = maskInstance.processInput({ prevValue: "+1(34*)-***-**-**", selectionStart: 4, selectionEnd: 5, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(3**)-***-**-**", "delete 4");
  assert.equal(result.cursorPosition, 4, "delete 4");

  result = maskInstance.processInput({ prevValue: "+1(345)-***-**-**", selectionStart: 5, selectionEnd: 6, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(34*)-***-**-**", "key delete 5");
  assert.equal(result.cursorPosition, 5, "key delete 5");

  result = maskInstance.processInput({ prevValue: "+1(345)-891-**-**", selectionStart: 10, selectionEnd: 11, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-89*-**-**", "key delete 1");
  assert.equal(result.cursorPosition, 10, "key delete 1");

  result = maskInstance.processInput({ prevValue: "+1(345)-89*-**-**", selectionStart: 9, selectionEnd: 10, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-8**-**-**", "delete 9 ");
  assert.equal(result.cursorPosition, 9, "delete 9");

  result = maskInstance.processInput({ prevValue: "+1(345)-891-12-15", selectionStart: 8, selectionEnd: 9, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-911-21-5*", "delete 8");
  assert.equal(result.cursorPosition, 8, "delete 8");

  result = maskInstance.processInput({ prevValue: "+1(345)-891-11-12", selectionStart: 16, selectionEnd: 17, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(345)-891-11-1*", "delete last character");
  assert.equal(result.cursorPosition, 16, "delete last character");

  result = maskInstance.processInput({ prevValue: "+1(123)-456-78-97", selectionStart: 8, selectionEnd: 9, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(123)-567-89-7*", "key delete 4");
  assert.equal(result.cursorPosition, 8, "key delete 4");
  settings.placeholderChar = "_";
});

QUnit.test("pattern processInput: delete characters by backspace", function(assert) {
  settings.placeholderChar = "*";
  const maskInstance = new InputMaskPattern();
  maskInstance.mask = "+\\1(999)-999-99-99";
  let result = maskInstance.processInput({ prevValue: "+1(34*)-***-**-**", selectionStart: 4, selectionEnd: 5, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(3**)-***-**-**", "delete 4");
  assert.equal(result.cursorPosition, 4, "delete 4");

  result = maskInstance.processInput({ prevValue: "+1(345)-***-**-**", selectionStart: 7, selectionEnd: 8, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(345)-***-**-**", "backspace delete - after )");
  assert.equal(result.cursorPosition, 7, "backspace delete - after )");

  result = maskInstance.processInput({ prevValue: "+1(345)-891-**-**", selectionStart: 11, selectionEnd: 12, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(345)-891-**-**", "backspace delete - after 1");
  assert.equal(result.cursorPosition, 11, "backspace delete - after 1");

  result = maskInstance.processInput({ prevValue: "+1(345)-89*-**-**", selectionStart: 9, selectionEnd: 10, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(345)-8**-**-**", "delete 9 ");
  assert.equal(result.cursorPosition, 9, "delete 9");

  result = maskInstance.processInput({ prevValue: "+1(345)-891-12-15", selectionStart: 8, selectionEnd: 9, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(345)-911-21-5*", "delete 8");
  assert.equal(result.cursorPosition, 8, "delete 8");

  result = maskInstance.processInput({ prevValue: "+1(345)-891-11-12", selectionStart: 16, selectionEnd: 17, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(345)-891-11-1*", "delete last character");
  assert.equal(result.cursorPosition, 16, "delete last character");

  result = maskInstance.processInput({ prevValue: "+1(***)-***-**-**", selectionStart: 0, selectionEnd: 0, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(***)-***-**-**", "delete first character");
  assert.equal(result.cursorPosition, 0, "delete first character");

  result = maskInstance.processInput({ prevValue: "+1(***)-***-**-**", selectionStart: 0, selectionEnd: 1, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(***)-***-**-**", "delete +");
  assert.equal(result.cursorPosition, 0, "delete +");

  result = maskInstance.processInput({ prevValue: "+1(123)-456-78-97", selectionStart: 8, selectionEnd: 9, insertedCharacters: null, inputDirection: "rightToLeft" });
  assert.equal(result.text, "+1(123)-567-89-7*", "key backspace 4");
  assert.equal(result.cursorPosition, 8, "key backspace 4");

  settings.placeholderChar = "_";
});

QUnit.test("pattern processInput: cut characters", function(assert) {
  settings.placeholderChar = "*";
  const maskInstance = new InputMaskPattern();
  maskInstance.mask = "+\\1(999)-999-99-99";
  let result = maskInstance.processInput({ prevValue: "+1(123)-456-78-97", selectionStart: 9, selectionEnd: 14, insertedCharacters: null, inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(123)-497-**-**", "cut #1");
  assert.equal(result.cursorPosition, 9, "cut #1");

  result = maskInstance.processInput({ prevValue: "+1(123)-456-78-97", selectionStart: 9, selectionEnd: 11, insertedCharacters: "00", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(123)-400-78-97", "cut + paste 2");
  assert.equal(result.cursorPosition, 12, "cut + paste #2");

  result = maskInstance.processInput({ prevValue: "+1(123)-456-78-97", selectionStart: 9, selectionEnd: 11, insertedCharacters: "000", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(123)-400-07-89", "cut + paste 3");
  assert.equal(result.cursorPosition, 13, "cut + paste #3");

  result = maskInstance.processInput({ prevValue: "+1(123)-456-78-97", selectionStart: 8, selectionEnd: 11, insertedCharacters: "00", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(123)-007-89-7*", "cut + paste 4.0");
  assert.equal(result.cursorPosition, 10, "cut + paste #4.0");

  result = maskInstance.processInput({ prevValue: "+1(123)-456-78-97", selectionStart: 9, selectionEnd: 13, insertedCharacters: "00", inputDirection: "leftToRight" });
  assert.equal(result.text, "+1(123)-400-89-7*", "cut + paste 4");
  assert.equal(result.cursorPosition, 12, "cut + paste #4");

  settings.placeholderChar = "_";
});

QUnit.test("pattern processInput: cut characters into middle string", function(assert) {
  settings.placeholderChar = "*";
  const maskInstance = new InputMaskPattern();
  maskInstance.mask = "99+\\1(999)-999";
  let result = maskInstance.processInput({ prevValue: "56+1(789)-123", selectionStart: 1, selectionEnd: 6, insertedCharacters: "2+14", inputDirection: "leftToRight" });
  assert.equal(result.text, "52+1(489)-123", "cut #1");
  assert.equal(result.cursorPosition, 6, "cut #1");

  result = maskInstance.processInput({ prevValue: "56+1(789)-123", selectionStart: 1, selectionEnd: 6, insertedCharacters: "000", inputDirection: "leftToRight" });
  assert.equal(result.text, "50+1(008)-912", "cut #2");
  assert.equal(result.cursorPosition, 7, "cut #2");

  result = maskInstance.processInput({ prevValue: "56+1(789)-123", selectionStart: 0, selectionEnd: 1, insertedCharacters: "000", inputDirection: "leftToRight" });
  assert.equal(result.text, "00+1(067)-891", "cut #3");
  assert.equal(result.cursorPosition, 6, "cut #3");

  settings.placeholderChar = "_";
});

QUnit.test("Serialize InputMaskPattern properties", function (assert) {
  const q = new QuestionTextModel("q1");
  const jsonObject = new JsonObject();
  let json = jsonObject.toJsonObject(q);
  assert.deepEqual(json, { name: "q1" }, "empty mask");

  q.maskType = "patternmask";
  json = jsonObject.toJsonObject(q);
  assert.deepEqual(json, { name: "q1", maskType: "patternmask" }, "empty patternmask");

  q.maskSettings["mask"] = "9999-9999";
  json = jsonObject.toJsonObject(q);
  assert.deepEqual(json, {
    name: "q1",
    maskType: "patternmask",
    maskSettings: {
      mask: "9999-9999"
    }
  }, "set mask patternmask");

  q.maskSettings["dataToSave"] = "masked";
  json = jsonObject.toJsonObject(q);
  assert.deepEqual(json, {
    name: "q1",
    maskType: "patternmask",
    maskSettings: {
      dataToSave: "masked",
      mask: "9999-9999"
    }
  }, "dataToSave patternmask");
});

QUnit.test("Deserialize InputMaskPattern properties", function (assert) {
  const q = new QuestionTextModel("q1");
  const jsonObject = new JsonObject();
  jsonObject.toObject({ name: "q1" }, q);
  let maskSettings = q.maskSettings as InputMaskPattern;
  assert.equal(q.maskType, "none");
  assert.equal(maskSettings.getType(), "masksettings");

  jsonObject.toObject({ name: "q1", maskType: "patternmask" }, q);
  maskSettings = q.maskSettings as InputMaskPattern;
  assert.equal(q.maskType, "patternmask");
  assert.equal(maskSettings.getType(), "patternmask", "patternmask type");
  assert.equal(maskSettings.mask, undefined, "patternmask mask");
  assert.equal(maskSettings.dataToSave, "unmasked", "patternmask dataToSave");

  jsonObject.toObject({
    name: "q1",
    maskType: "patternmask",
    maskSettings: {
      dataToSave: "masked",
      mask: "9999-9999",
    }
  }, q);
  maskSettings = q.maskSettings as InputMaskPattern;
  assert.equal(q.maskType, "patternmask");
  assert.equal(maskSettings.getType(), "patternmask", "patternmask type");
  assert.equal(maskSettings.mask, "9999-9999", "patternmask mask");
  assert.equal(maskSettings.dataToSave, "masked", "patternmask dataToSave");
});