auth.onAuthStateChanged(user => {
  if(user){
  user.getIdTokenResult().then(idTokenResult => {
    user.adminKantor = idTokenResult.claims.adminKantor;
    user.member = idTokenResult.claims.member;
    setupUI(user);
  })
    db.collection('htmlProduk').onSnapshot(snapshot =>{
        let changes = snapshot.docChanges();
        changes.forEach(change =>{
            if(change.type == 'added'){
              if(!document.querySelector('[data-id="' + change.doc.id + '"]')){
                daftarHTMLProduk(change.doc);
                setupUI(user);
                }
            } else if (change.type == 'removed'){
                let li = htmlProduk.querySelector('[data-id="' + change.doc.id + '"]');
                htmlProduk.removeChild(li);
            } else if (change.type == 'modified'){
                updateHTMLProduk(change.doc);
            }
        })
    })
  setupUI(user);
} else {
  setupUI();
}
})

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);

});

const setupUI = (user) => {
  if(user){
  let fitur = document.querySelectorAll('.fitur');
      $(document).ready(function() {
      db.collection('htmlProduk').onSnapshot(snapshot =>{
          let items = $('#htmlproduk > li').get();
        items.sort(function(a, b) {
          let keyA = $(a).data('date');
          let keyB = $(b).data('date');

          if (keyA > keyB) return -1;
          if (keyA < keyB) return 1;
          return 0;
        });
        let ul = $('#htmlproduk');
        $.each(items, function(i, li) {
          ul.append(li);
        });
        })
      })

    if(user.adminKantor == true || user.member == true || user.email == 'useradmin@galaxy.id'){
      document.querySelector('#tambah').style.display = 'block';
    }
    document.querySelector('#keluar').style.display = 'block';
    document.querySelector('#blue-layer').style.display = 'none';
    document.querySelector('#form-masuk').style.display = 'none';
    document.querySelector('#html-produk').style.display = 'block';
  } else {
    document.querySelector('#keluar').style.display = 'none';
    document.querySelector('#blue-layer').style.display = 'block';
    document.querySelector('#form-masuk').style.display = 'block';
    document.querySelector('#html-produk').style.display = 'none';
    document.querySelector('#tambah').style.display = 'none';
  }
}





const htmlProduk = document.querySelector('#htmlproduk');
const listModalHTMLProduk = document.querySelector('#list-modal-html-produk');

function daftarHTMLProduk(doc){
  let li = document.createElement('li');
  let modal = document.createElement('div');
  modal.setAttribute('id', 'modal-html-produk' + doc.id);
  modal.classList.add('modal')
  li.setAttribute('data-id', doc.id);
  let produk = doc.data().produk;
  let html = doc.data().html;
  let tanggal = doc.data().tanggal;
  let tanggalPerubahan = doc.data().tanggalPerubahan;
  if(tanggalPerubahan == undefined){
      tanggalPerubahan = '';
  } else {
      let bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];    
      let dd = String(new Date(tanggalPerubahan).getDate()).padStart(2, '0');
      let mm = String(new Date(tanggalPerubahan).getMonth() + 1).padStart(2, '0');
      let yyyy = new Date(tanggalPerubahan).getFullYear();
      let hh = ('0' + new Date(tanggalPerubahan).getHours()).slice(-2);
      let ms = ('0' + new Date(tanggalPerubahan).getMinutes()).slice(-2);      
      tanggalPerubahan = ' - ' + 'Last changed ' + dd + ' ' + bulan[mm] + ' ' + yyyy + ', ' + hh + ':' + ms;  
  }
  li.setAttribute('data-date', tanggal);

  li.innerHTML = `
        <div class="collapsible-header grey lighten-5 card-panel"><span id="produk-tampilan${doc.id}" class="produk-tampilan">${produk}</span> <span id="tanggal-perubahan${doc.id}" class="tanggal-perubahan">${tanggalPerubahan}</span></div>
        <button id="copas${doc.id}" class="btn fiturwaves-effect waves-light btn-large blue darken-2">Copy</button>
        <button id="hapus${doc.id}" class="hapus fitur btn waves-effect waves-light btn-large red lighten-1">x</button>
        <div class="collapsible-body ${doc.id}"> 
        <div id="html-tampilan${doc.id}" class="html-tampilan"></div> 
        <div class="konfigurasi"><a id="edit${doc.id}" class="btn waves-effect waves-light btn-medium amber lighten-1 modal-trigger" data-target="modal-html-produk${doc.id}">Edit</a> <a id="hapusKedua${doc.id}" class="btn waves-effect waves-light btn-medium red lighten-1">Hapus</a></div>
        </div>
`

  modal.innerHTML = `
    <div class="modal-content">
      <h4 class="center-align">Mengubah Replies</h4>
      <form id="html-produk-form${doc.id}">
        <div>
        <label>Produk</label>
          <input value="${produk}" type="text" id="produk${doc.id}" autocomplete="off" required/>
        </div>
        <div>
        <label>HTML</label>
          <textarea onfocus="auto_grow(this)" id="html${doc.id}" class="materialize-textarea" autocomplete="off" required/>${html.replace(/<br\s*[\/]?>/gi, "&#13;&#10;")}</textarea>
        </div>
        <div class="btn red darken-3 z-depth-0 modal-close dismiss">Tutup</div>
        <button type="submit" class="btn blue darken-3 z-depth-0 simpan">Simpan</button>
      </form>
    </div>
`

htmlProduk.appendChild(li);
listModalHTMLProduk.appendChild(modal);
document.querySelector('#html-tampilan' + doc.id).innerText = html.replace(/<br\s*\/?>/gi , '\n');

 let copas = document.querySelector("#copas" + doc.id);
 copas.addEventListener('click', function (e) {
    document.querySelector('#produk-tampilan' + doc.id).click();
    let text = document.querySelector("#html-tampilan" + doc.id);
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    //add to clipboard.
    document.execCommand('copy');

  });


let hapus = document.querySelector('#hapus' + doc.id);
hapus.addEventListener('click', function(e){
    e.stopPropagation();
    let konfirmasi = confirm('Anda yakin ingin menghapus kalimat ini ?');
    if(konfirmasi == true){
    db.collection('htmlProduk').doc(doc.id).delete();
    }
  });

let hapusKedua = document.querySelector('#hapusKedua' + doc.id);
hapusKedua.addEventListener('click', function(e){
    e.stopPropagation();
    let konfirmasi = confirm('Anda yakin ingin menghapus kalimat ini ?');
    if(konfirmasi == true){
    db.collection('htmlProduk').doc(doc.id).delete();
    }    
});

  let element = document.querySelector('#modal-html-produk' + doc.id);
  let instance = M.Modal.init(element)

  let formHTMLProduk = document.querySelector('#html-produk-form' + doc.id);
  formHTMLProduk.addEventListener('submit', function(e){
    e.preventDefault();
  db.collection('htmlProduk').doc(doc.id).update({
    produk : document.querySelector('#produk' + doc.id).value,
    penggunaUID : auth.currentUser.uid,
    html : document.querySelector('#html' + doc.id).value.replace(/\n\r?/g, '<br/>'),
    tanggalPerubahan : new Date().getTime()
    }).then(() => {
      instance.close();
    })
  })

}

function updateHTMLProduk(doc){
    let produk = doc.data().produk;
    let html = doc.data().html;
    let tanggalPerubahan = doc.data().tanggalPerubahan;
    let bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];    
    let dd = String(new Date(tanggalPerubahan).getDate()).padStart(2, '0');
    let mm = String(new Date(tanggalPerubahan).getMonth() + 1).padStart(2, '0');
    let yyyy = new Date(tanggalPerubahan).getFullYear();
    let hh = ('0' + new Date(tanggalPerubahan).getHours()).slice(-2);
    let ms = ('0' + new Date(tanggalPerubahan).getMinutes()).slice(-2);    
    tanggalPerubahan = dd + ' ' + bulan[mm] + ' ' + yyyy + ', ' + hh + ':' + ms;
    document.querySelector('#produk-tampilan' + doc.id).innerHTML = produk;
    document.querySelector('#html-tampilan' + doc.id).innerText = html.replace(/<br\s*\/?>/gi , '\n');
    document.querySelector('#tanggal-perubahan' + doc.id).innerHTML = ' - ' + 'Last changed ' + tanggalPerubahan;
}

const createForm = document.querySelector('#html-produk-form');
createForm.addEventListener('submit', (e) => {
    e.preventDefault();

    db.collection('htmlProduk').add({
        produk: createForm['produk'].value,
        html: createForm['html'].value.replace(/\n\r?/g, '<br/>'),
        tanggal : new Date().getTime()
    }).then(() => {
        const modal = document.querySelector('#modal-html-produk');
        M.Modal.getInstance(modal).close();
        createForm.reset();
    })
})

function auto_grow(element){
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}


const formMasuk = document.querySelector('#form-masuk');
formMasuk.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = formMasuk['email'].value;
  const password = formMasuk['password'].value;

  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    formMasuk.reset();
    console.clear();
  }, err => {
    if(err.code == 'auth/user-not-found'){
        alert('User tidak ditemukan.')
    }else if(err.code == 'auth/wrong-password'){
        alert('Email atau Password yang anda masukkan salah!')
    } 
  });

});

const keluar = document.querySelector('#keluar');
keluar.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    let konfirmasi = confirm("Apa anda yakin ingin keluar?");
    if(konfirmasi){
    auth.signOut();
    }
});