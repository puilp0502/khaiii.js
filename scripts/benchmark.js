const Khaiii = require("../dist/khaiii");
const path = require("path");
(() => {
    const resourceDir = path.join(__dirname, "../bin/resources");
    const khaiiiPromise = Khaiii.initialize({
        resourceProvider: "nodefs",
        resourceRoot: resourceDir,
    });
    return khaiiiPromise.then((khaiii) => {
        const start = process.hrtime();
        for (let i = 0; i < 1000; i++) {
            khaiii.analyze("KHAIII는 카카오에서 개발한 세 번째 형태소 분석기임.")
        }
        const duration = process.hrtime(start);
        const ms = duration[0] * 1000 + duration[1] / 1000000;
        console.log(ms);
        return ms;
    })
})();