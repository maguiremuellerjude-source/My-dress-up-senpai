// Simple dress-up game logic
const itemsContainer = document.getElementById('items');
const modelsContainer = document.getElementById('models');
const layerContainer = document.getElementById('layerContainer');
const inspector = document.getElementById('inspector');
const scaleInput = document.getElementById('scale');
const rotateInput = document.getElementById('rotate');
const resetBtn = document.getElementById('reset');
const randomizeBtn = document.getElementById('randomize');
const saveBtn = document.getElementById('save');
const bringFrontBtn = document.getElementById('bringFront');
const sendBackBtn = document.getElementById('sendBack');
const removeBtn = document.getElementById('remove');
let selected = null;
let zCounter = 1;

// Wardrobe data (category: head/top/bottom/shoes)
const wardrobe = [
  {src:'assets/clothes/hat.svg', name:'Hat', cat:'head'},
  {src:'assets/clothes/hat2.svg', name:'Hat 2', cat:'head'},
  {src:'assets/clothes/shirt.svg', name:'Shirt', cat:'top'},
  {src:'assets/clothes/jacket.svg', name:'Jacket', cat:'top'},
  {src:'assets/clothes/dress.svg', name:'Dress', cat:'top'},
  {src:'assets/clothes/skirt.svg', name:'Skirt', cat:'bottom'},
  {src:'assets/clothes/pants.svg', name:'Pants', cat:'bottom'},
  {src:'assets/clothes/shoes.svg', name:'Shoes', cat:'shoes'}
];

// Populate items by category
function populateItems(cat='all'){
  itemsContainer.innerHTML = '';
  const list = wardrobe.filter(i => cat === 'all' ? true : i.cat === cat);
  list.forEach(i => {
    const b = document.createElement('button');
    b.className = 'item';
    b.dataset.src = i.src;
    b.innerHTML = `<img src="${i.src}" alt="${i.name}"><span>${i.name}</span>`;
    itemsContainer.appendChild(b);
  });
}

function addItem(src){
  const img = document.createElement('img');
  img.src = src;
  img.className = 'layer';
  img.style.transform = 'translate(-50%, -50%) scale(1) rotate(0deg)';
  img.style.left = '50%';
  img.style.top = '52%';
  img.style.width = '180px';
  img.style.zIndex = ++zCounter;
  img.draggable = false;
  layerContainer.appendChild(img);

  makeDraggable(img);
  img.addEventListener('click', e => {
    e.stopPropagation();
    selectItem(img);
  });
  selectItem(img);
}

function selectItem(el){
  if(!el) return deselect();
  selected = el;
  inspector.style.visibility = 'visible';
  inspector.setAttribute('aria-hidden','false');
  const t = getTransform(el);
  scaleInput.value = t.scale;
  rotateInput.value = t.rotate;
}

function deselect(){
  selected = null;
  inspector.style.visibility = 'hidden';
  inspector.setAttribute('aria-hidden','true');
}

function getTransform(el){
  const st = el.style.transform.match(/scale\(([^)]+)\)/);
  const rt = el.style.transform.match(/rotate\(([^)]+)deg\)/);
  return {scale: st ? parseFloat(st[1]) : 1, rotate: rt ? parseFloat(rt[1]) : 0};
}

scaleInput.addEventListener('input',()=>{
  if(!selected) return;
  const t = getTransform(selected);
  selected.style.transform = `translate(-50%, -50%) scale(${scaleInput.value}) rotate(${t.rotate}deg)`;
});
rotateInput.addEventListener('input',()=>{
  if(!selected) return;
  const t = getTransform(selected);
  selected.style.transform = `translate(-50%, -50%) scale(${t.scale}) rotate(${rotateInput.value}deg)`;
});

bringFrontBtn.addEventListener('click', ()=>{ if(selected) selected.style.zIndex = ++zCounter; });
sendBackBtn.addEventListener('click', ()=>{ if(selected) selected.style.zIndex = 1; });
removeBtn.addEventListener('click', ()=>{ if(selected){ selected.remove(); deselect(); }});

resetBtn.addEventListener('click', ()=>{ layerContainer.innerHTML = ''; deselect(); });

randomizeBtn.addEventListener('click', ()=>{
  const srcs = Array.from(document.querySelectorAll('.item')).map(b=>b.dataset.src);
  layerContainer.innerHTML = '';
  const count = 3 + Math.floor(Math.random()*3);
  for(let i=0;i<count;i++){
    const s = srcs[Math.floor(Math.random()*srcs.length)];
    addItem(s);
    const img = layerContainer.lastElementChild;
    img.style.left = (40 + Math.random()*20) + '%';
    img.style.top = (45 + Math.random()*25) + '%';
    const sc = 0.6 + Math.random()*1.2;
    img.style.transform = `translate(-50%, -50%) scale(${sc}) rotate(${Math.floor(Math.random()*360)}deg)`;
  }
});

saveBtn.addEventListener('click', ()=>{
  const preview = document.getElementById('preview');
  html2canvas(preview, {backgroundColor:null}).then(canvas=>{
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'outfit.png';
    a.click();
    showToast('Saved outfit');
  });
});

function showToast(msg, time=1600){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), time);
}

// keyboard shortcuts: R reset, S save, Z randomize
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Delete' && selected){ selected.remove(); deselect(); }
  if(e.key.toLowerCase() === 'r'){ layerContainer.innerHTML = ''; deselect(); showToast('Reset'); }
  if(e.key.toLowerCase() === 'z'){ document.getElementById('randomize').click(); showToast('Randomized'); }
  if(e.key.toLowerCase() === 's'){ document.getElementById('save').click(); showToast('Saving...'); }
});

// Model switching: clicking a model button changes base model and clears outfit
modelsContainer.addEventListener('click', e => {
  const b = e.target.closest('.model-item');
  if(!b) return;
  modelsContainer.querySelectorAll('.model-item').forEach(x=>x.classList.remove('selected'));
  b.classList.add('selected');
  const src = b.dataset.src;
  document.getElementById('model').src = src;
  layerContainer.innerHTML = ''; // reset outfit when switching model
  deselect();
  showToast('Model changed');
});

// category filters
document.querySelectorAll('.cat').forEach(c=>c.addEventListener('click', e => {
  document.querySelectorAll('.cat').forEach(x=>x.classList.remove('active'));
  e.currentTarget.classList.add('active');
  populateItems(e.currentTarget.dataset.cat);
}));

// click items to add (delegation)
itemsContainer.addEventListener('click', e => {
  const b = e.target.closest('.item');
  if(!b) return;
  addItem(b.dataset.src);
});

// populate initial
populateItems('all');

// click outside to deselect
document.getElementById('preview').addEventListener('click', e=>{ if(e.target.id === 'preview' || e.target.id === 'model') deselect(); });

// draggable (pointer events)
function makeDraggable(el){
  let dragging = false, ox=0, oy=0, startX=0, startY=0;
  el.addEventListener('pointerdown', e=>{
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    dragging=true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    ox = rect.left + rect.width/2;
    oy = rect.top + rect.height/2;
    el.style.cursor = 'grabbing';
    selectItem(el);
  });
  window.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const parentRect = layerContainer.getBoundingClientRect();
    // compute new center position
    const cx = ox + dx; const cy = oy + dy;
    const left = ((cx - parentRect.left) / parentRect.width) * 100;
    const top = ((cy - parentRect.top) / parentRect.height) * 100;
    el.style.left = left + '%';
    el.style.top = top + '%';
  });
  window.addEventListener('pointerup', e=>{
    if(dragging){ dragging=false; el.releasePointerCapture?.(e.pointerId); el.style.cursor='grab'; }
  });
}

// keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if(e.key === 'Delete' && selected){ selected.remove(); deselect(); }
});

// initial demo items
if(!layerContainer.children.length){
  // optional: start with nothing
}
