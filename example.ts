// do not use this for commerically
const vs = `# version 300 es
layout (location = 0) in vec4 aPos;
layout (location = 1) in vec2 aTexCoords;

out vec2 TexCoords;

void main() {
  TexCoords = aTexCoords;
  gl_Position = aPos;
}
`;
const fs = `# version 300 es
precision highp float;

uniform sampler2D img;
uniform sampler2D img2;
uniform sampler2D markingTexture;
uniform float time;

in vec2 TexCoords;
out vec4 FragColor;

float rnd(vec2 uv){
  float x = dot(uv,vec2(2.5,0.75));
  float y = dot(uv,vec2(3.66,0.74));
  float result = (sin(x) + cos(y))*100.;
  return fract(result);
}

void main() {
  vec4 frostTexture = texture(img2,TexCoords);
  vec2 random = vec2(rnd(TexCoords+frostTexture.r),rnd(TexCoords+frostTexture.g)) * 0.11;
  vec2 effectArea = vec2(0.97,0.0001);
  float distFromCenter = distance(TexCoords,vec2(0.5,0.5));
  float effectWeightTime = 7.0 - time;
  if(effectWeightTime < 0.0001){
    effectWeightTime = 0.0001;
  }
  float effectWeight = pow(1.0-smoothstep(effectArea.x,effectArea.y,distFromCenter),effectWeightTime);
  
  random *= frostTexture.rg * effectWeight;
  
  vec2 uv = TexCoords;
  uv += random;
  
  vec4 frostLineColor = vec4(0.7,1.0,1.0,0.8);
  vec4 markingTextureColor = texture(markingTexture,TexCoords);
  
  if(markingTextureColor.r == 1.0){
    FragColor = texture(img,TexCoords);
    return;
  }
  
  FragColor = mix(texture(img,uv),vec4(frostLineColor),vec4(random.y));
}
`;

const fboVS = `# version 300 es
layout (location = 0) in vec4 aPos;
layout (location = 1) in vec2 aTexCoords;

out vec2 TexCoords;

void main() {
  TexCoords = aTexCoords;
  gl_Position = aPos;
}
`;

const fboFS = `# version 300 es
precision highp float;

uniform float coordX;
uniform float coordY;
uniform sampler2D fboTexture;

in vec2 TexCoords;
out vec4 FragColor;

float radius = 0.05;

void main() {
  vec2 clickCoords = vec2(coordX,coordY);
  vec4 currentTexture = texture(fboTexture,TexCoords);
  float distance = length(clickCoords - TexCoords);
  
  if(distance < radius && currentTexture.r != 1.0){
    FragColor = vec4(1.0,0.0,0.0,1.0);
    return;
  }
  
  FragColor = currentTexture;
}
`;
function loadImage(str) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  return new Promise((resolve) => {
    image.onload = () => {
      resolve(image);
    };

    image.src = str;
  });
}

const canvas = document.querySelector("canvas");
const width = canvas.clientWidth;
const height = canvas.clientHeight;

canvas.width = width;
canvas.height = height;

let textureX = -100;
let textureY = -100;

let isPressing = false;
let pressTimeout;

function getEventCoords(event) {
  if (event.touches) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    };
  } else {
    return { clientX: event.clientX, clientY: event.clientY };
  }
}

canvas.addEventListener("mousedown", (event) => {
  isPressing = true;
  const canvasCoords = getMousePositionInCanvas(canvas, event);
  const textureCoords = convertToTextureCoords(
    canvas,
    canvasCoords.x,
    canvasCoords.y
  );
  textureX = textureCoords.textureX;
  textureY = textureCoords.textureY;
});

canvas.addEventListener(
  "touchstart",
  (event) => {
    isPressing = true;
    const touchCoords = getEventCoords(event);
    const canvasCoords = getMousePositionInCanvas(canvas, touchCoords);
    const textureCoords = convertToTextureCoords(
      canvas,
      canvasCoords.x,
      canvasCoords.y
    );
    textureX = textureCoords.textureX;
    textureY = textureCoords.textureY;
    event.preventDefault();
  },
  { passive: false }
);

canvas.addEventListener("mousemove", (event) => {
  if (isPressing) {
    const canvasCoords = getMousePositionInCanvas(canvas, event);
    const textureCoords = convertToTextureCoords(
      canvas,
      canvasCoords.x,
      canvasCoords.y
    );
    textureX = textureCoords.textureX;
    textureY = textureCoords.textureY;
  }
});

canvas.addEventListener(
  "touchmove",
  (event) => {
    if (isPressing) {
      const touchCoords = getEventCoords(event);
      const canvasCoords = getMousePositionInCanvas(canvas, touchCoords);
      const textureCoords = convertToTextureCoords(
        canvas,
        canvasCoords.x,
        canvasCoords.y
      );
      textureX = textureCoords.textureX;
      textureY = textureCoords.textureY;
    }
    event.preventDefault();
  },
  { passive: false }
);

canvas.addEventListener("mouseup", () => {
  isPressing = false;
});

canvas.addEventListener("touchend", () => {
  isPressing = false;
});

canvas.addEventListener("mouseleave", () => {
  isPressing = false;
});

function getMousePositionInCanvas(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  return { x, y };
}

function convertToTextureCoords(canvas, x, y) {
  const textureX = x / width;
  const textureY = (height - y) / height;

  return { textureX, textureY };
}

const gl = canvas.getContext("webgl2");

async function main() {
  const img = await loadImage(
    "https://res.cloudinary.com/dponedhzq/image/upload/v1728826071/7351c4e3-3d6f-49cd-b935-6ad0d4825359_pmanho.webp"
  );
  const img2 = await loadImage(
    "https://assets.codepen.io/4214530/%EB%B2%84%EC%84%AF%ED%8F%AC%EC%9E%90.png"
  );

  gl.viewport(0, 0, width, height);
  // shader 생성
  const vsShader = createShader(vs, gl.VERTEX_SHADER);
  const fsShader = createShader(fs, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  if (!program) {
    console.error("쉐이더 프로그램 생성 실패!!!!!!!!!!");
    return;
  }

  gl.attachShader(program, vsShader);
  gl.attachShader(program, fsShader);

  gl.linkProgram(program);

  gl.deleteShader(vsShader);
  gl.deleteShader(fsShader);

  const isSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!isSuccess) {
    console.error("쉐이더 프로그램 링크 실패!");
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  // fbo shader 생성
  const fboVsShader = createShader(fboVS, gl.VERTEX_SHADER);
  const fboFsShader = createShader(fboFS, gl.FRAGMENT_SHADER);

  const fboProgram = gl.createProgram();
  if (!fboProgram) {
    console.error("쉐이더 프로그램 생성 실패!!!!!!!!!!");
    return;
  }

  gl.attachShader(fboProgram, fboVsShader);
  gl.attachShader(fboProgram, fboFsShader);

  gl.linkProgram(fboProgram);

  gl.deleteShader(fboVsShader);
  gl.deleteShader(fboFsShader);

  const fboIsSuccess = gl.getProgramParameter(fboProgram, gl.LINK_STATUS);
  if (!fboIsSuccess) {
    console.error("쉐이더 프로그램 링크 실패!");
    console.error(gl.getProgramInfoLog(fboProgram));
    return;
  }

  // 텍스처 생성
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // 보일러플레이트
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  const texture2 = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture2);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // 보일러플레이트
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img2);

  const fbo1 = createFBO();
  const fbo2 = createFBO();
  let fboIndex = 0;

  const fbos = [fbo1.fbo, fbo2.fbo];
  const fboTextures = [fbo1.fboTexture, fbo2.fboTexture];

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const data = [
    // 첫 번째 삼각형
    -1,
    1,
    1.0,
    0.0,
    1.0, // 상단 왼쪽
    1,
    1,
    1.0,
    1.0,
    1.0, // 상단 오른쪽
    -1,
    -1,
    1.0,
    0.0,
    0.0, // 하단 왼쪽

    // 두 번째 삼각형
    1,
    1,
    1.0,
    1.0,
    1.0, // 상단 오른쪽
    1,
    -1,
    1.0,
    1.0,
    0.0, // 하단 오른쪽
    -1,
    -1,
    1.0,
    0.0,
    0.0, // 하단 왼쪽
  ];

  const vao = gl.createVertexArray();
  const vbo = gl.createBuffer();

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  const fbt = Float32Array.BYTES_PER_ELEMENT;
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * fbt, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * fbt, 3 * fbt);

  const animate = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindVertexArray(vao);
    fboIndex++;

    // fbo test
    const selectFBO = fbos[fboIndex % 2];
    const selectTexture = fboTextures[fboIndex % 2];
    const putTexture = fboTextures[(fboIndex + 1) % 2];

    gl.bindFramebuffer(gl.FRAMEBUFFER, selectFBO);
    gl.useProgram(fboProgram);
    gl.uniform1i(gl.getUniformLocation(fboProgram, "coordX"), textureX);
    gl.uniform1i(gl.getUniformLocation(fboProgram, "coordY"), textureY);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, putTexture);
    gl.uniform1i(gl.getUniformLocation(fboProgram, "fboTexture"), 0);

    gl.uniform1f(gl.getUniformLocation(fboProgram, "coordX"), textureX);
    gl.uniform1f(gl.getUniformLocation(fboProgram, "coordY"), textureY);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // reset
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 1.0);
    gl.useProgram(program);
    // 0번 텍스처 활성화
    gl.uniform1i(gl.getUniformLocation(program, "img"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "img2"), 1);
    gl.uniform1f(
      gl.getUniformLocation(program, "time"),
      performance.now() / 1000
    );

    const imgLocation = gl.getUniformLocation(program, "img");
    const img2Location = gl.getUniformLocation(program, "img2");
    const markingTextureLocation = gl.getUniformLocation(
      program,
      "markingTexture"
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(imgLocation, 0); // 유니폼에 TEXTURE0 유닛 전달 (0번 유닛)

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.uniform1i(img2Location, 1); // 유니폼에 TEXTURE1 유닛 전달 (1번 유닛)

    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, selectTexture);
    gl.uniform1i(markingTextureLocation, 2);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(animate);
  };

  animate();
}

main();

function createShader(shaderSource, type) {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("쉐이더 생성 실패!!!!!!!!!!!");
    return;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  const isSuccess = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  if (!isSuccess) {
    console.error("컴파일 실패!!!!!!!!!!!!!!!!!!");
    console.error(gl.getShaderInfoLog(shader));
    return;
  }

  return shader;
}

function createFBO() {
  const fbo = gl.createFramebuffer();
  gl.viewport(0, 0, width, height);
  const fboTexture = gl.createTexture();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.bindTexture(gl.TEXTURE_2D, fboTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // 보일러플레이트
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    fboTexture,
    0
  );

  return {
    fbo,
    fboTexture,
  };
}
