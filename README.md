# khaiii.js
khaiii.js는 WASM을 기반으로 한 한국어 형태소 분석기 [khaiii](https://github.com/kakao/khaiii)의 JS 이식판입니다.  
WASM이 지원되는 JS 런타임, 즉 브라우저와 Node.js 환경 모두에서 사용할 수 있습니다.  (브라우저에서는 fetch API 또한 필요합니다.)
# 설치하기
다른 NPM 패키지와 동일한 방식으로 설치할 수 있습니다.
```bash
$ npm i khaiii
```
# 사용법
Khaiii.js를 사용해서 Node.js 상에서 형태소 분석을 진행하는 예제입니다.
```js
const Khaiii = require('khaiii');  // 라이브러리 불러오기
const khaiii = await Khaiii.initialize();  // Khaiii 인스턴스 초기화
let result = khaiii.analyze('대한민국은 민주공화국이다.');  // 형태소 분석 진행
/* result = 
[
  {
    "word": "대한민국은", "begin": 0, "length": 5,
    "morphs": [
      { "lex": "대한민국", "tag": "NNP", "begin": 0, "length": 4 },
      { "lex": "은", "tag": "JX", "begin": 4,"length": 1 }
    ]
  },
  ...]
*/
```

# API
## `initialize(KhaiiiConfig?): Promise<Khaiii>`
새 khaiii 인스턴스를 초기화합니다. KhaiiiConfig의 형태는 다음과 같습니다.
```typescript
type KhaiiiConfig = {
  resourceProvider?: "webfs" | "nodefs";
  resourceRoot?: string;
  KhaiiiOption?: any;
};
```
### resourceProvider
Khaiii가 사용할 리소스 제공자를 선택합니다. 가능한 선택지로는 `"webfs"`, `"nodefs"`가 있습니다.   
`webfs`의 경우 Khaiii 리소스를 fetch API를 통해 웹에서 받아옵니다.  
`nodefs`의 경우, Node.js 환경에서 로컬 디렉토리를 Khaii 리소스 디렉토리로 마운트합니다.  
지정되지 않을 경우, 환경 감지를 통해 적절한 제공자를 선택합니다. 환경 감지에 실패할 경우 오류가 발생합니다.

### resourceRoot
Khaiii 리소스의 경로를 지정합니다. (Khaiii 리소스 디렉토리는 embed.bin 파일을 포함하는 디렉토리입니다.)  
`webfs`의 경우 Khaiii 리소스를 호스트 중인 루트 URL이며, `nodefs`의 경우 Khaiii 리소스가 저장된 로컬 디렉토리 경로입니다.  
지정되지 않았을 경우 `webfs`의 경우 `resource/`의, `nodefs`의 경우 `__dirname + '/resources/'`의 기본값을 가집니다.  
  
즉, `webfs` 사용 시 현재 페이지와 같은 디렉토리 안에 존재하는 `resource` 디렉토리를 기본값으로 사용하며,  `nodefs`의 경우 khaiii.js 패키지에 번들된 리소스를 사용합니다.

### KhaiiiOption
libkhaiii API의 `khaiii_open`에 전달되는 옵션입니다. 자세한 설명은 khaiii 문서 및 [khaiii_api.c](https://github.com/kakao/khaiii/blob/v0.4/src/main/cpp/khaiii/khaiii_api.cpp#L47) 소스 코드를 참고해 주십시오.

### 반환값
초기화된 새 Khaiii 객체를 반환합니다.

## `Khaiii.analyze(input: string, option?: unknown): KhaiiiWord[]`
`input`을 형태소 분석한 결과를 반환합니다.  
KhaiiiWord는 다음과 같은 형태를 가집니다.
```typescript
type KhaiiiMorph = {
  lex: string;    // 형태소
  tag: string;    // POS 태그
  begin: number;  // input에서 형태소 시작 위치
  length: number; // input에서 형태소 길이
};

type KhaiiiWord = {
  word: string;   // 단어 (띄어쓰기로 구분된 어절)
  begin: number;  // input에서 단어 시작 위치
  length: number; // input에서 단어 길이
  morphs: KhaiiiMorph[];  // 단어 안의 형태소 모음 배열
};
```
### input
형태소 분석을 진행할 대상 문자열입니다.
### option
libkhaiii API의 `khaiii_analyze`에 전달되는 옵션입니다. 자세한 설명은 khaiii 문서 및 [khaiii_api.c](https://github.com/kakao/khaiii/blob/v0.4/src/main/cpp/khaiii/khaiii_api.cpp#L65) 소스 코드를 참고해 주십시오.
### 반환값
`input`을 형태소 분석한 결과를 `KhaiiiWord[]` 형태로 반환합니다.

# 빌드하기
khaiii.js를 빌드하기 위해서는 시스템에 Docker가 설치되어 있어야 합니다.  
### 리포지토리 클론
```bash
$ git clone https://github.com/puilp0502/khaiii.js
```
### WASM 바이너리 빌드
```bash
$ cd khaiii.js
$ npm run build-wasm
```
C++ khaiii를 Emscripten 툴체인을 사용해 WASM으로 빌드하는 과정입니다. 위 과정은 시간이 많이 걸릴 수 있습니다.  
만약 디버그용 WASM 바이너리를 빌드하고자 한다면, 아래 명령어를 통해 빌드할 수 있습니다.
```bash
$ KHAIII_DEBUG=1 scripts/build-libkhaiii.sh 
```
### 패키징
```bash
$ npm run build
```
Webpack을 사용해 UMD 형식으로 라이브러리를 빌드 및 패키징하는 과정입니다. 빌드 결과물은 `dist/`에 저장됩니다.