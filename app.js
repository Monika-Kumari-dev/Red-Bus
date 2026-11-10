const destinations = [
  {
    name: "Goa",
    tag: "Diwali by the Sea",
    cls: "goa",
    image:
      "https://cdn.atrsafari.com/cdn/05explore/locations-and-lodges/asia/india/goa/0/stills/00page/01GOA-IM0001-goa-1920.jpg"
  },
  {
    name: "Manali",
    tag: "Diwali in the Mountains",
    cls: "manali",
    image:
      "https://media.assettype.com/deccanherald/2026-05-21/p151a2fl/file85xwfn8ae0hsjayrnui.jpg?ar=40%3A21&auto=format%2Ccompress&mode=crop&ogImage=true&w=1200"
  },
  {
    name: "Jaipur",
    tag: "A Diwali Full of Color",
    cls: "jaipur",
    image:
      "https://www.sundaytour.com.tw/upfiles/chinese/attractions/tw_attractions_caty01594955955.jpg"
  },
  {
    name: "Kerala",
    tag: "A Naturally Bright Diwali",
    cls: "kerala",
    image:
      "https://www.livehindustan.com/web-stories/plan-to-visit-these-places-in-kerala-with-children-_Nv_Y1KFU64s0NPF1La8/assets/2.jpeg"
  }
];

/* =========================================================
   ELEMENTS
   ========================================================= */

const create = document.querySelector("#create");
const cameraPanel = document.querySelector("#cameraPanel");
const video = document.querySelector("#video");
const canvas = document.querySelector("#canvas");
const finalSection = document.querySelector("#final");
const finalPhoto = document.querySelector("#finalPhoto");
const printPhoto = document.querySelector("#printPhoto");

let selected = null;
let stream = null;
let cameraMode = "user";

let capturedPhotos = [];

/* 5 photos are required for:
   2 TOP + 1 CENTER + 2 BOTTOM */
const MAX_PHOTOS = 5;


/* =========================================================
   NAVIGATION
   ========================================================= */

function openCreate() {
  if (!create) return;

  create.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

document
  .querySelector("#startBtn")
  ?.addEventListener("click", openCreate);

document
  .querySelector("#jumpCreate")
  ?.addEventListener("click", openCreate);


/* =========================================================
   DESTINATIONS / JOURNEY SECTION
   ========================================================= */

const grid =
  document.querySelector("#destinations");

if (grid) {

  destinations.forEach((d) => {

    const card =
      document.createElement("article");

    card.className =
      "destination";

    card.innerHTML = `
      <div
        class="dest-img ${d.cls}"
        style="
          background-image:
          linear-gradient(
            180deg,
            rgba(8,28,45,.02) 35%,
            rgba(8,28,45,.68) 100%
          ),
          url('${d.image}')
        "
      ></div>

      <div class="dest-content">

        <small>
          ${d.tag}
        </small>

        <h3>
          ${d.name}
        </h3>

        <span class="destination-cta">
          CHOOSE BACKDROP →
        </span>

      </div>
    `;

    card.addEventListener(
      "click",
      () => openCamera(d, card)
    );

    grid.appendChild(card);
  });
}


/* =========================================================
   CAMERA
   ========================================================= */

async function openCamera(
  destination,
  card
) {

  selected = destination;

  capturedPhotos = [];

  document
    .querySelectorAll(".destination")
    .forEach((item) => {

      item.classList.remove(
        "selected"
      );

    });

  card?.classList.add("selected");

  cameraPanel?.classList.remove(
    "hidden"
  );

  setupMultiCaptureUI();

  cameraPanel?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  try {

    if (
      !navigator.mediaDevices?.getUserMedia
    ) {

      throw new Error(
        "Camera is not supported by this browser."
      );

    }

    cameraMode = "user";

    stream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraMode,
          width: {
            ideal: 1280
          },
          height: {
            ideal: 720
          }
        },
        audio: false
      });

    video.srcObject =
      stream;

    await video.play();

    updateCaptureUI();

  } catch (error) {

    console.error(error);

    alert(
      "Please allow camera access to capture your Diwali photo."
    );
  }
}


/* =========================================================
   SWITCH CAMERA
   ========================================================= */

async function switchCamera(mode) {

  if (!navigator.mediaDevices?.getUserMedia) {
    alert("Camera is not supported by this browser.");
    return;
  }

  try {
    stopCamera();
    cameraMode = mode;

    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: cameraMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    video.srcObject = stream;
    await video.play();
  } catch (error) {
    console.error(error);
    alert(
      mode === "environment"
        ? "Back camera is not available on this device/browser."
        : "Front camera is not available on this device/browser."
    );
  }
}


/* =========================================================
   UPLOAD PHOTO FROM DEVICE
   ========================================================= */

function handlePhotoUpload(event) {

  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  const availableSlots = MAX_PHOTOS - capturedPhotos.length;

  files.slice(0, availableSlots).forEach((file) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      capturedPhotos.push(reader.result);
      updateCaptureUI();

      if (capturedPhotos.length === MAX_PHOTOS) {
        setTimeout(finishPhotos, 250);
      }
    };

    reader.readAsDataURL(file);
  });

  event.target.value = "";
}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera() {

  if (stream) {

    stream
      .getTracks()
      .forEach((track) => track.stop());

    stream = null;
  }

  if (video) {

    video.srcObject = null;
  }
}


/* =========================================================
   MULTI PHOTO UI
   ========================================================= */

function setupMultiCaptureUI() {

  const cameraWrap =
    document.querySelector(".camera-wrap");

  if (!cameraWrap) return;


  /* CAMERA / UPLOAD CONTROLS */

  const frontBtn = document.querySelector("#frontCameraBtn");
  const backBtn = document.querySelector("#backCameraBtn");
  const uploadBtn = document.querySelector("#uploadPhotoBtn");
  const uploadInput = document.querySelector("#photoUpload");

  const controlStyle = `
    border:1px solid rgba(255,255,255,.28);
    border-radius:999px;
    padding:10px 13px;
    background:rgba(89,37,44,.9);
    color:#fff;
    font:800 9px/1 Arial,sans-serif;
    letter-spacing:1px;
    cursor:pointer;
    box-shadow:0 5px 16px rgba(0,0,0,.18);
  `;

  [frontBtn, backBtn, uploadBtn].forEach((button) => {
    if (button) button.style.cssText = controlStyle;
  });

  const controls = document.querySelector("#cameraControls");
  if (controls) {
    controls.style.cssText = `
      display:flex;
      justify-content:center;
      align-items:center;
      flex-wrap:wrap;
      gap:8px;
      margin:12px auto 0;
      padding:0 10px;
    `;
  }

  if (frontBtn && !frontBtn.dataset.bound) {
    frontBtn.dataset.bound = "1";
    frontBtn.addEventListener("click", () => switchCamera("user"));
  }

  if (backBtn && !backBtn.dataset.bound) {
    backBtn.dataset.bound = "1";
    backBtn.addEventListener("click", () => switchCamera("environment"));
  }

  if (uploadBtn && uploadInput && !uploadBtn.dataset.bound) {
    uploadBtn.dataset.bound = "1";
    uploadBtn.addEventListener("click", () => {
      if (capturedPhotos.length >= MAX_PHOTOS) {
        alert("You already have 5 photos.");
        return;
      }
      uploadInput.click();
    });
  }

  if (uploadInput && !uploadInput.dataset.bound) {
    uploadInput.dataset.bound = "1";
    uploadInput.addEventListener("change", handlePhotoUpload);
  }


  /* PHOTO COUNTER */

  let counter =
    document.querySelector(
      "#captureCounter"
    );

  if (!counter) {

    counter =
      document.createElement("div");

    counter.id =
      "captureCounter";

    counter.style.cssText = `
      position:absolute;
      top:14px;
      left:50%;
      transform:translateX(-50%);
      z-index:50;
      padding:8px 14px;
      border-radius:999px;
      background:rgba(89,37,44,.88);
      color:#fff;
      font:800 11px/1 Arial,sans-serif;
      letter-spacing:1.2px;
      white-space:nowrap;
      pointer-events:none;
    `;

    cameraWrap.appendChild(
      counter
    );
  }


  /* DONE BUTTON */

  let doneBtn =
    document.querySelector(
      "#donePhotos"
    );

  if (!doneBtn) {

    doneBtn =
      document.createElement("button");

    doneBtn.id =
      "donePhotos";

    doneBtn.type =
      "button";

    doneBtn.textContent =
      "DONE";

    doneBtn.style.cssText = `
      position:absolute;
      right:16px;
      bottom:20px;
      z-index:50;
      border:0;
      border-radius:9px;
      padding:13px 18px;
      background:#d84e55;
      color:#fff;
      font:800 10px/1 Arial,sans-serif;
      letter-spacing:1.3px;
      cursor:pointer;
      box-shadow:0 8px 22px rgba(0,0,0,.22);
      display:none;
    `;

    cameraWrap.appendChild(
      doneBtn
    );

    doneBtn.addEventListener(
      "click",
      finishPhotos
    );
  }


  /* SMALL PHOTO PREVIEW */

  let preview =
    document.querySelector(
      "#capturePreview"
    );

  if (!preview) {

    preview =
      document.createElement("div");

    preview.id =
      "capturePreview";

    preview.style.cssText = `
      position:absolute;
      left:10px;
      bottom:10px;
      z-index:49;
      display:flex;
      gap:5px;
      max-width:calc(100% - 100px);
      overflow:hidden;
      pointer-events:none;
    `;

    cameraWrap.appendChild(
      preview
    );
  }
}


/* =========================================================
   UPDATE CAPTURE UI
   ========================================================= */

function updateCaptureUI() {

  const counter =
    document.querySelector(
      "#captureCounter"
    );

  const doneBtn =
    document.querySelector(
      "#donePhotos"
    );

  const preview =
    document.querySelector(
      "#capturePreview"
    );


  if (counter) {

    counter.textContent =
      capturedPhotos.length >= MAX_PHOTOS
        ? "5 PHOTOS READY"
        : `PHOTO ${
            capturedPhotos.length + 1
          } OF ${MAX_PHOTOS}`;
  }


  if (doneBtn) {

    doneBtn.style.display =
      capturedPhotos.length > 0
        ? "block"
        : "none";

    doneBtn.disabled =
      capturedPhotos.length === 0;

    doneBtn.style.opacity =
      capturedPhotos.length === 0
        ? ".5"
        : "1";
  }


  if (preview) {

    preview.innerHTML = "";

    capturedPhotos.forEach(
      (src) => {

        const img =
          document.createElement("img");

        img.src = src;

        img.style.cssText = `
          width:48px;
          height:48px;
          object-fit:cover;
          border:2px solid #fff;
          border-radius:6px;
          box-shadow:0 3px 10px rgba(0,0,0,.3);
        `;

        preview.appendChild(
          img
        );
      }
    );
  }


  const captureButton =
    document.querySelector(
      "#capture"
    );

  if (captureButton) {

    captureButton.disabled =
      capturedPhotos.length >= MAX_PHOTOS;

    captureButton.style.opacity =
      capturedPhotos.length >= MAX_PHOTOS
        ? ".45"
        : "1";
  }
}


/* =========================================================
   CAPTURE PHOTO
   ========================================================= */

function capturePhoto() {

  if (
    !video ||
    !canvas ||
    capturedPhotos.length >= MAX_PHOTOS
  ) {
    return;
  }

  const width =
    video.videoWidth || 1280;

  const height =
    video.videoHeight || 720;

  canvas.width =
    width;

  canvas.height =
    height;

  const ctx =
    canvas.getContext("2d");


  /* MIRROR FRONT CAMERA ONLY */

  if (cameraMode === "user") {
    ctx.save();

    ctx.translate(
      width,
      0
    );

    ctx.scale(
      -1,
      1
    );

    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );

    ctx.restore();
  } else {
    ctx.drawImage(
      video,
      0,
      0,
      width,
      height
    );
  }


  /* SAVE PHOTO */

  capturedPhotos.push(
    canvas.toDataURL(
      "image/jpeg",
      0.94
    )
  );


  updateCaptureUI();


  /* AUTOMATICALLY FINISH AFTER 5TH PHOTO */

  if (
    capturedPhotos.length === MAX_PHOTOS
  ) {

    setTimeout(
      finishPhotos,
      250
    );
  }
}

document
  .querySelector("#capture")
  ?.addEventListener(
    "click",
    capturePhoto
  );


/* =========================================================
   FINISH PHOTOS
   ========================================================= */

async function finishPhotos() {

  if (!capturedPhotos.length) {
    return;
  }

  stopCamera();

  const collage =
    await createCollage(
      capturedPhotos
    );

  if (!collage) return;


  if (finalPhoto) {

    finalPhoto.src =
      collage;
  }


  if (printPhoto) {

    printPhoto.src =
      collage;
  }


  /* REMOVE OLD DESTINATION TEXT */

  const photoDestination =
    document.querySelector(
      "#photoDestination"
    );

  if (photoDestination) {

    photoDestination.textContent =
      "";
  }


  const printDestination =
    document.querySelector(
      "#printDestination"
    );

  if (printDestination) {

    printDestination.textContent =
      "";
  }


  const finalText =
    document.querySelector(
      "#finalText"
    );

  if (finalText) {

    finalText.textContent =
      "";
  }


  finalSection?.classList.remove(
    "hidden"
  );

  finalSection?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* =========================================================
   LOAD IMAGE
   ========================================================= */

function loadImage(src) {

  return new Promise(
    (resolve, reject) => {

      const img =
        new Image();

      img.onload =
        () => resolve(img);

      img.onerror =
        reject;

      img.src =
        src;
    }
  );
}




/* Local SVG stays sharp in the preview, download, and print. */
async function loadRedBusLogo() {
  try {
    return await loadImage("./redbus-logo.svg");
  } catch (error) {
    console.warn("redBus logo could not be loaded.", error);
    return null;
  }
}

/* =========================================================
   FINAL redBus DIWALI COLLAGE
   ========================================================= */

async function createCollage(photos) {
  /*
    Final output is exactly 4 × 6 inches at 300 DPI:
    1200 × 1800 pixels.
  */
  const W = 1200;
  const H = 1800;

  const output = document.createElement("canvas");
  output.width = W;
  output.height = H;

  const ctx = output.getContext("2d");

  /* =======================================================
     OUTER DESIGN
     ======================================================= */

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "#d7b65a";
  ctx.lineWidth = 5;
  ctx.strokeRect(45, 38, 1110, 1724);

  const panelX = 70;
  const panelY = 55;
  const panelW = 1060;
  const panelH = 1690;

  ctx.fillStyle = "#fff0f1";
  ctx.fillRect(
    panelX,
    panelY,
    panelW,
    panelH
  );

  /* =======================================================
     redBus LOGO — LARGE TOP LEFT
     ======================================================= */

  const logo = await loadRedBusLogo();

if (logo) {

  const maxLogoWidth = 430;
  const maxLogoHeight = 155;

  const iw =
    logo.width ||
    logo.naturalWidth;

  const ih =
    logo.height ||
    logo.naturalHeight;

  const scale =
    Math.min(
      maxLogoWidth / iw,
      maxLogoHeight / ih
    );

  const logoWidth =
    iw * scale;

  const logoHeight =
    ih * scale;

  const logoX = 105;
  const logoY = 82;


  /* -------------------------------------------------------
     3D DEPTH SHADOW
     ------------------------------------------------------- */

  ctx.save();

  ctx.globalAlpha = 0.32;

  ctx.shadowColor =
    "rgba(0,0,0,0.55)";

  ctx.shadowBlur = 12;

  ctx.shadowOffsetX = 8;

  ctx.shadowOffsetY = 10;

  ctx.drawImage(
    logo,
    logoX,
    logoY,
    logoWidth,
    logoHeight
  );

  ctx.restore();


  /* -------------------------------------------------------
     EXTRA DARK DEPTH
     ------------------------------------------------------- */

  ctx.save();

  ctx.globalAlpha = 0.18;

  ctx.drawImage(
    logo,
    logoX + 3,
    logoY + 4,
    logoWidth,
    logoHeight
  );

  ctx.restore();


  /* -------------------------------------------------------
     MAIN ORIGINAL LOGO
     ------------------------------------------------------- */

  ctx.save();

  ctx.drawImage(
    logo,
    logoX,
    logoY,
    logoWidth,
    logoHeight
  );

  ctx.restore();
}


/* =========================================================
   redBus DIWALI 2026
   ========================================================= */

ctx.save();

ctx.textAlign =
  "center";

ctx.textBaseline =
  "middle";

ctx.font =
  "900 42px Arial, Helvetica, sans-serif";


/* -------------------------------------------------------
   TITLE SHADOW
   ------------------------------------------------------- */

ctx.fillStyle =
  "rgba(166,47,60,0.30)";

ctx.fillText(
  "HAPPY DIWALI WITH redBus",
  W / 2,
  255
);


/* -------------------------------------------------------
   MAIN TITLE
   ------------------------------------------------------- */

ctx.fillStyle =
  "#a62f3c";

ctx.fillText(
  "HAPPY DIWALI WITH redBus",
  W / 2,
  248
);

ctx.restore();


/* =========================================================
   HEART DIVIDER
   ========================================================= */

ctx.save();

ctx.strokeStyle =
  "rgba(166,47,60,0.45)";

ctx.lineWidth = 2;


/* LEFT LINE */

ctx.beginPath();

ctx.moveTo(
  300,
  290
);

ctx.lineTo(
  555,
  290
);

ctx.stroke();


/* RIGHT LINE */

ctx.beginPath();

ctx.moveTo(
  645,
  290
);

ctx.lineTo(
  900,
  290
);

ctx.stroke();


/* HEART */

ctx.fillStyle =
  "#a62f3c";

ctx.font =
  "34px Arial, sans-serif";

ctx.textAlign =
  "center";

ctx.textBaseline =
  "middle";

ctx.fillText(
  "♥",
  W / 2,
  290
);

ctx.restore();

  /* =======================================================
     HEART DIVIDER
     ======================================================= */

  ctx.save();

  ctx.strokeStyle =
    "rgba(166,47,60,0.45)";

  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(300, 270);
  ctx.lineTo(555, 270);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(645, 270);
  ctx.lineTo(900, 270);
  ctx.stroke();

  ctx.fillStyle = "#a62f3c";
  ctx.font = "34px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    "♥",
    W / 2,
    270
  );

  ctx.restore();

  /* =======================================================
     LOAD PHOTOS
     ======================================================= */

  const images = [];

  for (const photo of photos) {
    try {
      const image = await loadImage(photo);

      if (image) {
        images.push(image);
      }
    } catch (error) {
      console.warn(
        "Photo loading failed:",
        error
      );
    }
  }

  if (!images.length) {
    return output.toDataURL(
      "image/jpeg",
      0.96
    );
  }

  /* =======================================================
     PHOTO AREA
     ======================================================= */

  const photoX = 95;
  const photoW = 1010;
  const photoTop = 305;
  const gap = 14;
  const smallW = (photoW - gap) / 2;

  /* 1 PHOTO */
  if (images.length === 1) {
    drawImageCover(
      ctx,
      images[0],
      photoX,
      photoTop,
      photoW,
      1250
    );
  }

  /* 2 PHOTOS */
  else if (images.length === 2) {
    drawImageCover(
      ctx,
      images[0],
      photoX,
      photoTop,
      smallW,
      1250
    );

    drawImageCover(
      ctx,
      images[1],
      photoX + smallW + gap,
      photoTop,
      smallW,
      1250
    );
  }

  /* 3 PHOTOS */
  else if (images.length === 3) {
    const topH = 300;
    const centerY =
      photoTop + topH + gap;
    const centerH = 700;

    drawImageCover(
      ctx,
      images[0],
      photoX,
      photoTop,
      smallW,
      topH
    );

    drawImageCover(
      ctx,
      images[1],
      photoX + smallW + gap,
      photoTop,
      smallW,
      topH
    );

    drawImageCover(
      ctx,
      images[2],
      photoX,
      centerY,
      photoW,
      centerH
    );
  }

  /* 4 PHOTOS */
  else if (images.length === 4) {
    const cellH = 600;

    images.forEach((img, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);

      drawImageCover(
        ctx,
        img,
        photoX + col * (smallW + gap),
        photoTop + row * (cellH + gap),
        smallW,
        cellH
      );
    });
  }

  /* 5 PHOTOS */
  else {
    const topH = 300;
    const centerH = 700;
    const bottomH = 300;

    const centerY =
      photoTop + topH + gap;

    const bottomY =
      centerY + centerH + gap;

    /* Top left */
    drawImageCover(
      ctx,
      images[0],
      photoX,
      photoTop,
      smallW,
      topH
    );

    /* Top right */
    drawImageCover(
      ctx,
      images[1],
      photoX + smallW + gap,
      photoTop,
      smallW,
      topH
    );

    /* Large center */
    drawImageCover(
      ctx,
      images[2],
      photoX,
      centerY,
      photoW,
      centerH
    );

    /* Bottom left */
    drawImageCover(
      ctx,
      images[3],
      photoX,
      bottomY,
      smallW,
      bottomH
    );

    /* Bottom right */
    drawImageCover(
      ctx,
      images[4],
      photoX + smallW + gap,
      bottomY,
      smallW,
      bottomH
    );
  }

  ctx.save();
  ctx.fillStyle = "#a62f3c";
  ctx.font = "700 36px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Happy Diwali with redBus", W / 2, 1695);
  // Draw matching diyas directly so exports do not depend on emoji fonts.
  for (const x of [335, 865]) {
    ctx.fillStyle = "#d84e55";
    ctx.beginPath();
    ctx.ellipse(x, 1690, 25, 15, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#e9ac48";
    ctx.fillRect(x - 25, 1687, 50, 4);
    ctx.fillStyle = "#ffb632";
    ctx.beginPath();
    ctx.moveTo(x, 1685);
    ctx.bezierCurveTo(x - 20, 1674, x - 6, 1660, x + 2, 1651);
    ctx.bezierCurveTo(x + 4, 1665, x + 17, 1677, x, 1685);
    ctx.fill();
  }
  ctx.restore();

  return output.toDataURL(
    "image/jpeg",
    0.96
  );
}
/* =========================================================
   DRAW IMAGE — COVER
   ========================================================= */

function drawImageCover(
  ctx,
  img,
  x,
  y,
  width,
  height
) {

  if (!img) return;

  const imageWidth =
    img.naturalWidth ||
    img.width;

  const imageHeight =
    img.naturalHeight ||
    img.height;

  if (
    !imageWidth ||
    !imageHeight
  ) {
    return;
  }


  /* COVER */

  const scale =
    Math.max(
      width / imageWidth,
      height / imageHeight
    );

  const drawWidth =
    imageWidth *
    scale;

  const drawHeight =
    imageHeight *
    scale;

  const drawX =
    x +
    (width - drawWidth) / 2;

  const drawY =
    y +
    (height - drawHeight) / 2;


  ctx.save();

  /* CLIP TO PHOTO BOX */

  ctx.beginPath();

  ctx.rect(
    x,
    y,
    width,
    height
  );

  ctx.clip();


  ctx.drawImage(
    img,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  ctx.restore();
}


/* =========================================================
   DOWNLOAD
   ========================================================= */

document
  .querySelector("#download")
  ?.addEventListener(
    "click",
    async () => {

      const data =
        await createCollage(
          capturedPhotos
        );

      if (!data) return;

      const link =
        document.createElement(
          "a"
        );

      link.href =
        data;

      link.download =
        "redBus-HAPPY-DIWALI.jpg";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();
    }
  );


/* =========================================================
   PRINT — EXACT 4 × 6 INCH
   ========================================================= */

document
  .querySelector("#printBtn")
  ?.addEventListener(
    "click",
    async () => {

      const data =
        await createCollage(
          capturedPhotos
        );

      if (!data) return;


      const printWindow =
        window.open(
          "",
          "_blank",
          "width=450,height=700"
        );


      if (!printWindow) {

        alert(
          "Please allow pop-ups to print your redBus Diwali photo."
        );

        return;
      }


      printWindow.document.open();


      printWindow.document.write(`

        <!doctype html>

        <html>

        <head>

          <meta charset="UTF-8">

          <title>
            redBus Diwali
          </title>

          <style>

            @page {
              size: 4in 6in;
              margin: 0;
            }

            html,
            body {

              width: 4in;
              height: 6in;

              margin: 0;
              padding: 0;

              overflow: hidden;

              background: #fff;
            }

            img {

              display: block;

              width: 4in;
              height: 6in;

              object-fit: contain;

              object-position: center;
            }

          </style>

        </head>

        <body>

          <img
            src="${data}"
            alt="redBus Diwali"
          >

        </body>

        </html>

      `);


      printWindow.document.close();


      setTimeout(
        () => {

          printWindow.focus();

          printWindow.print();

        },
        500
      );
    }
  );


/* =========================================================
   CREATE ANOTHER
   ========================================================= */

document
  .querySelector("#again")
  ?.addEventListener(
    "click",
    () => {

      stopCamera();

      capturedPhotos = [];

      selected = null;

      finalSection?.classList.add(
        "hidden"
      );

      cameraPanel?.classList.add(
        "hidden"
      );


      document
        .querySelectorAll(
          ".destination"
        )
        .forEach(
          (item) =>
            item.classList.remove(
              "selected"
            )
        );


      openCreate();
    }
  );


/* =========================================================
   BACK TO JOURNEY
   ========================================================= */

document
  .querySelector("#backDest")
  ?.addEventListener(
    "click",
    () => {

      stopCamera();

      capturedPhotos = [];

      cameraPanel?.classList.add(
        "hidden"
      );

      document
        .querySelectorAll(
          ".destination"
        )
        .forEach(
          (item) =>
            item.classList.remove(
              "selected"
            )
        );

      create?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  );