// Inicializando o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Função para calcular desconto
async function calculateDiscount(sessionType, promoCode) {
  const sessionPrices = {
    1: 349.99,
    2: 599.99,
    3: 849.99
  };

  let discount = 0;
  if (promoCode) {
    // Verifica se o cupom é válido e obtém o percentual de desconto
    const cuponsRef = db.collection('cupons');
    const querySnapshot = await cuponsRef.where('codePromo', '==', promoCode).get();
    if (!querySnapshot.empty) {
      const couponData = querySnapshot.docs[0].data();
      discount = couponData.discount / 100; // Assumindo que 'discount' é um campo no documento do cupom
    }
  }

  const price = sessionPrices[sessionType];
  const discountedPrice = price - (price * discount);

  return discountedPrice.toFixed(2);
}

// Função para redirecionar para o WhatsApp
function redirectToWhatsApp(phoneNumber, artistName, sessionType, finalPrice) {
  const sessionDescriptions = {
    1: "1 Produção Completa",
    2: "2 Produções Completas",
    3: "3 Produções Completas"
  };

  const message = `Olá, meu nome é ${artistName} e gostaria de solicitar uma sessão de ${sessionDescriptions[sessionType]} por R$ ${finalPrice}.`;
  const url = `https://wa.me/5561984694839?text=${encodeURIComponent(message)}`;
  window.location.href = url;
}

// Função para atualizar o preço final
async function updateFinalPrice() {
  const sessionType = document.getElementById('sessionType').value;
  const promoCode = document.getElementById('promoCode').value;

  const finalPrice = await calculateDiscount(sessionType, promoCode);
  document.getElementById('finalPriceDisplay').innerText = `Preço Final: R$ ${finalPrice}`;
}

// Lida com o envio do formulário
document.getElementById('sessionForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const artistName = document.getElementById('artistName').value;
  const email = document.getElementById('email').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const sessionType = document.getElementById('sessionType').value;
  const promoCode = document.getElementById('promoCode').value;

  const finalPrice = await calculateDiscount(sessionType, promoCode);

      // Salva os dados no Firebase
      db.collection('sessions').add({
        artistName,
        email,
        phoneNumber,
        sessionType,
        promoCode,
        finalPrice
      })
      .then(() => {
        console.log('Dados salvos com sucesso!');
        redirectToWhatsApp(phoneNumber, artistName, sessionType, finalPrice);
      })
      .catch((error) => {
        console.error('Erro ao salvar os dados: ', error);
      });


  
});

// Adiciona eventos de mudança nos campos relevantes para atualizar o preço final
document.getElementById('sessionType').addEventListener('change', updateFinalPrice);
document.getElementById('promoCode').addEventListener('input', updateFinalPrice);

// Adiciona máscara ao campo de número de celular
const phoneNumberInput = document.getElementById('phoneNumber');

phoneNumberInput.addEventListener('input', function (e) {
  let x = e.target.value.replace(/\D/g, '');
  if (x.length > 11) {
    x = x.slice(0, 11);
  }
  let match = x.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  if (match) {
    e.target.value = '(' + (match[1] ? match[1] : '') + ') ' + (match[2] ? match[2] : '') + (match[3] ? '-' + match[3] : '');
  }
  if (e.target.value.length > 15) {
    e.target.value = e.target.value.slice(0, 15);
  }
});


// Alternar entre modos dark e light
const toggleModeBtn = document.getElementById('toggleModeBtn');
const selectMode = document.getElementById('sessionType');
const artistName = document.getElementById('artistName');
const email = document.getElementById('email');
const phoneNumber = document.getElementById('phoneNumber');
const promoCode = document.getElementById('promoCode');

toggleModeBtn.addEventListener('click', function() {
  const body = document.body;
  if (body.classList.contains('light-mode')) {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    document.getElementById('sessionType').style.color = 'white';
    toggleModeBtn.innerHTML = '<i class="bi bi-toggle-on"></i> Dark';
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');    
    toggleModeBtn.innerHTML = '<i class="bi bi-toggle-off"></i> Light';
    selectMode.style.color = '#6B6B6C'
    artistName.style.color = 'black'
    email.style.color = 'black'
    phoneNumber.style.color = 'black'
    promoCode.style.color = 'black'
  }
});

// Atualiza o preço final quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  updateFinalPrice();
});