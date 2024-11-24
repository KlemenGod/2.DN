const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let dodajZlepek = -1;

let zlepki = [];
let curKrivulja = [];

let trenutnaTocka;
let trenutniZlepek;

function drawBezzier(krivulja) {
  const res = 1000;
  ctx.beginPath();

  if (krivulja == trenutniZlepek) {
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
  } else {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
  }

  ctx.moveTo(krivulja[0].x, krivulja[0].y);
  for (let t = 0; t <= 1 + 1 / res; t += 1 / res) {
    const tocka = bezzierRec(krivulja, t);
    ctx.lineTo(tocka.x, tocka.y);
  }
  ctx.stroke();

  for (let i = 0; i < krivulja.length; i++) {
    drawPoint(
      krivulja[i].x,
      krivulja[i].y,
      i == 0 || i == krivulja.length - 1 ? "red" : "blue",
      3
    );
  }
}

function bezzierRec(tocke, t) {
  if (tocke.length == 2) {
    const x = (1 - t) * tocke[0].x + t * tocke[1].x;
    const y = (1 - t) * tocke[0].y + t * tocke[1].y;
    return { x, y };
  }

  let noveTocke = [];

  for (let i = 0; i < tocke.length - 1; i++) {
    const x = (1 - t) * tocke[i].x + t * tocke[i + 1].x;
    const y = (1 - t) * tocke[i].y + t * tocke[i + 1].y;
    noveTocke.push({ x, y });
  }

  return bezzierRec(noveTocke, t);
}

function izrisiZlepke(zlepki) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < zlepki.length; i++) {
    drawBezzier(zlepki[i]);
  }
}

//eventi
canvas.addEventListener("click", (event) => {
  if (trenutnaTocka) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  if (dodajZlepek > 0) {
    drawPoint(x, y, "red", 4);
    curKrivulja.push({ x, y });
    dodajZlepek--;
  }
  if (dodajZlepek == 0) {
    dodajZlepek = -1;
    document.getElementById("dodajZlepekGumb").style.color = "black";
    zlepki.push(curKrivulja);
    curKrivulja = [];

    izrisiZlepke(zlepki);
  }
  if (dodajZlepek < 0) {
    trenutniZlepek = izberiZlepek(x, y, 100);
    izrisiZlepke(zlepki);
    console.log(trenutniZlepek);
  }
});

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  trenutnaTocka = izberiTocko(x, y, 3);
});

canvas.addEventListener("mousemove", (event) => {
  if (!trenutnaTocka) return;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  trenutnaTocka.x = x;
  trenutnaTocka.y = y;
  izrisiZlepke(zlepki);
});

canvas.addEventListener("mouseup", () => {
  trenutnaTocka = null;
});

canvas.addEventListener("mouseleave", () => {
  trenutnaTocka = null;
});

function dodajZlepekButton() {
  dodajZlepek = 4;
}

function izbrisiZlepekButton() {
  for (let i = 0; i < zlepki.length; i++) {
    if (zlepki[i] == trenutniZlepek) {
      zlepki.splice(i, 1);
      izrisiZlepke(zlepki);
      return;
    }
  }
}

function zagotoviC0() {
  if (!trenutniZlepek || zlepki.length < 2 || jePovezan(trenutniZlepek)) return;

  const excl = [
    structuredClone(trenutniZlepek[0]),
    structuredClone(trenutniZlepek[trenutniZlepek.length - 1]),
  ];
  const tocka1 = izberiTocko(
    trenutniZlepek[0].x,
    trenutniZlepek[0].y,
    -1,
    "endPointOther",
    excl
  );

  const tocka2 = izberiTocko(
    trenutniZlepek[trenutniZlepek.length - 1].x,
    trenutniZlepek[trenutniZlepek.length - 1].y,
    -1,
    "endPointOther",
    excl
  );

  if (!(tocka1 && tocka2)) return;

  const premikX = tocka1.x - trenutniZlepek[0].x;
  const premikY = tocka1.y - trenutniZlepek[0].y;

  trenutniZlepek[0] = tocka1;
  trenutniZlepek[1].x += premikX;
  trenutniZlepek[1].y += premikY;

  const premikX2 = tocka2.x - trenutniZlepek[trenutniZlepek.length - 1].x;
  const premikY2 = tocka2.y - trenutniZlepek[trenutniZlepek.length - 1].y;

  trenutniZlepek[trenutniZlepek.length - 1] = tocka2;

  trenutniZlepek[trenutniZlepek.length - 2].x += premikX2;
  trenutniZlepek[trenutniZlepek.length - 2].y += premikY2;

  izrisiZlepke(zlepki);
}

function zagotoviC1() {
  if (!trenutniZlepek || zlepki.length < 2) return;

  if (!jePovezan(trenutniZlepek)) zagotoviC0();

  let p1, k1, k2;
  let p2, k3, k4;
  for (let i = 0; i < zlepki.length; i++) {
    if (zlepki[i] == trenutniZlepek) continue;
    for (let a = 0; a < zlepki[i].length; a++) {
      const p = zlepki[i][a];
      if (p == trenutniZlepek[0]) {
        p1 = p;
        k1 = trenutniZlepek[1];
        k2 = a == 0 ? zlepki[i][1] : zlepki[i][zlepki[i].length - 2];
      }
      if (p == trenutniZlepek[trenutniZlepek.length - 1]) {
        p2 = p;
        k3 = trenutniZlepek[trenutniZlepek.length - 2];
        k4 = a == 0 ? zlepki[i][1] : zlepki[i][zlepki[i].length - 2];
      }
    }
  }

  const anglek1 = Math.atan((p1.y - k1.y) / (p1.x - k1.x));
  const anglek2 = Math.atan(-(p1.y - k2.y) / -(p1.x - k2.x));

  const anglek3 = Math.atan((p2.y - k3.y) / (p2.x - k3.x));
  const anglek4 = Math.atan(-(p2.y - k4.y) / -(p2.x - k4.x));

  const angle = (anglek1 + anglek2) / 2;
  const angle2 = (anglek3 + anglek4) / 2;

  const dolzinak1 = Math.sqrt(
    Math.pow(p1.x - k1.x, 2) + Math.pow(p1.y - k1.y, 2)
  );
  const dolzinak2 = Math.sqrt(
    Math.pow(p1.x - k2.x, 2) + Math.pow(p1.y - k2.y, 2)
  );

  const dolzinak3 = Math.sqrt(
    Math.pow(p2.x - k3.x, 2) + Math.pow(p2.y - k3.y, 2)
  );
  const dolzinak4 = Math.sqrt(
    Math.pow(p2.x - k4.x, 2) + Math.pow(p2.y - k4.y, 2)
  );

  k1.x = p1.x + Math.cos(angle) * dolzinak1;
  k1.y = p1.y + Math.sin(angle) * dolzinak1;
  k2.x = p1.x + Math.cos(angle + Math.PI) * dolzinak2;
  k2.y = p1.y + Math.sin(angle + Math.PI) * dolzinak2;

  k3.x = p2.x + Math.cos(angle2) * dolzinak3;
  k3.y = p2.y + Math.sin(angle2) * dolzinak3;
  k4.x = p2.x + Math.cos(angle2 + Math.PI) * dolzinak4;
  k4.y = p2.y + Math.sin(angle2 + Math.PI) * dolzinak4;

  izrisiZlepke(zlepki);
}

//pomozne
function drawPoint(x, y, color, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function jePovezan(zlepek) {
  for (let i = 0; i < zlepki.length; i++) {
    const z = zlepki[i];
    if (z == zlepek) continue;
    if (
      (z[0] == zlepek[0] && z[z.length - 1] == zlepek[zlepek.length - 1]) ||
      (z[0] == zlepek[zlepek.length - 1] && z[z.length - 1] == zlepek[0])
    ) {
      return true;
    }
  }
  return false;
}

function izberiTocko(x, y, r, tip = "all", excl = []) {
  let najTocka;
  let najD;

  for (let i = 0; i < zlepki.length; i++) {
    const zlepek = zlepki[i];
    for (let a = 0; a < zlepek.length; a++) {
      const d = Math.sqrt(
        Math.pow(zlepek[a].x - x, 2) + Math.pow(zlepek[a].y - y, 2)
      );

      if (d < r && r >= 0) {
        if (tip == "all") return zlepek[a];
      } else if (r == -1) {
        if (tip == "endPointOther") {
          if ((a == 0 || a == zlepek.length - 1) && (!najD || d < najD)) {
            if (
              !excl.some((tocka) => {
                return tocka.x == zlepek[a].x && tocka.y == zlepek[a].y;
              })
            ) {
              najTocka = zlepki[i][a];
              najD = d;
            }
          }
        }
      }
    }
  }
  return najTocka;
}

function izberiZlepek(x, y, r) {
  let zlepekNaj;
  let dist;
  zlepki.forEach((zlepek) => {
    zlepek.forEach((tocka) => {
      let d = Math.sqrt(Math.pow(tocka.x - x, 2) + Math.pow(tocka.y - y, 2));

      if ((d < dist || !dist) && d < r) {
        dist = d;
        zlepekNaj = zlepek;
      }
    });
  });

  return zlepekNaj;
}
