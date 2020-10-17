const Khaiii = require("../dist/khaiii");
const path = require("path");
const result = require("./result.json");

test("loads correctly", () => {
  const resourceDir = path.join(__dirname, "../bin/resources");
  return Khaiii.initialize({
    resourceProvider: "nodefs",
    resourceRoot: resourceDir,
  });
});

test("analyze correctly", () => {
  const resourceDir = path.join(__dirname, "../bin/resources");
  const khaiiiPromise = Khaiii.initialize({
    resourceProvider: "nodefs",
    resourceRoot: resourceDir,
  });
  return expect(
    khaiiiPromise.then((khaiii) =>
      khaiii.analyze("KHAIII는 카카오에서 개발한 세 번째 형태소 분석기입니다.")
    )
  ).resolves.toEqual(result);
});
