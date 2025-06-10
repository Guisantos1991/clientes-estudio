import './styles.css';
import './cardStyles.css';


// === Firebase Setup ===
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDoc,
  query, where, orderBy, limit, getDocs, doc, Timestamp, updateDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === Render Card Principal ===
const container = document.querySelector("#clientsContainer") as HTMLElement | null;

function renderCard(data: any) {
  if (!container) return;

  const nascimentoFormatted = (data.dataNascimento instanceof Timestamp
  ? data.dataNascimento.toDate()
  : new Date(data.dataNascimento)
).toLocaleDateString("pt-BR");

const pagamentoFormatted = (data.dataPagamento instanceof Timestamp
  ? data.dataPagamento.toDate()
  : new Date(data.dataPagamento)
).toLocaleDateString("pt-BR");
  const ensaioFormatted = (data.dataEnsaio instanceof Timestamp ? data.dataEnsaio.toDate() : new Date(data.dataEnsaio)).toLocaleDateString("pt-BR");
 

  const valorAlbum = Number(data.valorAlbum) || 0;
  const fotosExtras = Number(data.fotosExtras) || 0;
  const valorEnsaio = Number(data.valorEnsaio) || 0;
  const valorVendaTotal = valorAlbum + fotosExtras + valorEnsaio;

  const totalFormatted = valorVendaTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  container.innerHTML = `
    <div class="card active">
      <div class="card-content flex flex--column">
        <div class="top-card">
          <div class="name-text">
            <h1 class="nomeCrianca">${data.nomeCrianca}</h1>
          </div>
          <div class="type-ensaio">
            <h2 class="tipoEnsaio">${data.ensaios}</h2>
          </div>
        </div>
        <br/>
        <div class="mid-card">
          <div class="mid-info flex flex--column">
            <div class="info-box">
              <label>Responsável:</label>
              <span class="info-text">${data.nomeResponsavel}</span>
            </div>
            <div class="info-box">
              <label>Data Aniversário:</label>
              <span class="info-text">${nascimentoFormatted}</span>
            </div>
            <div class="info-box">
              <label>Telefone:</label>
              <div class="flex flex--row items--center justify--center div--tel gap--10">
                <a href="tel:${data.telefone}">${data.telefone}</a>
              </div>
            </div>
            <div class="info-box">
              <label>Fotográfa:</label>
              <span class="info-text">${data.fotografo}</span>
            </div>  
          </div>
          <div class="mid-info flex flex--column">
            <div class="info-box">
              <label>Data Ensaio:</label>
              <span class="info-text">${ensaioFormatted}</span>
            </div>
            <div class="info-box">
              <label>Status Ensaio:</label>
              <span class="info-text" id="statusEnsaioSpan">${data.statusEnsaio}</span>
            </div>
            <div class="info-box">
              <label>Pagamento:</label>
              <span class="info-text" id="statusPagamentoSpan">${data.statusPagamento}</span>
            </div>
            <div class="info-box">
              <label>Data Pagamento:</label>
              <span class="info-text" id="dataPagamentoSpan">${pagamentoFormatted}</span>
            </div>
          </div>
          <div class="mid-info">
            <div class="info-box">
              <label>Qtd. Fotos:</label>
              <span class="info-text--2">${data.quantidadeFotos}</span>
            </div>
            <div class="info-box">
              <label>Fotos Extras:</label>
              <span class="info-text--2" id="fotosExtrasSpan">${data.fotosExtras}</span>
            </div>
            <div class="info-box">
              <label>Fotos Impressas:</label>
              <span class="info-text--2" id="quantidadeImpressasSpan">${data.quantidadeImpressas}</span>
            </div>
            <div class="info-box">
              <label>Álbum:</label>
              <span class="info-text--2" id="albumSpan">${data.album}</span>
            </div>
            <div class="info-box">
              <label>Quadro:</label>
              <span class="info-text--2" id="quadroSpan">${data.quadro}</span>
            </div>
          </div>
          <div class="mid-info">
            <div class="info-box">
              <label>Valor Álbum:</label>
              <span class="info-text" id="valorAlbumSpan">R$ ${valorAlbum.toFixed(2)}</span>
            </div>
            <div class="info-box">
              <label>Valor Ensaio:</label>
              <span class="info-text" id="valorEnsaioSpan">R$ ${valorEnsaio.toFixed(2)}</span>
            </div>
            <div class="info-box">
              <label>Valor Extras:</label>
              <span class="info-text">R$ ${data.foto}</span>
            </div>

          </div>
          <div class="mid-info">
            <div class="info-box">
              <label>Parcelas:</label>
              <span class="info-text--2">${Number(data.quantidadeParcelas) || 0}</span>
            </div>
            <div class="info-box">
              <label>Valor Pagamento:</label>
              <span class="info-text">R$ ${(Number(data.valorPagamento) || 0).toFixed(2)}</span>
            </div>
            <div class="info-box">
              <label>Valor Total:</label>
              <span class="info-text">${totalFormatted}</span>
            </div>
          </div>
        </div>
        <button id="editSaveBtn">Editar</button>
      </div>
    </div>
  `;

  const agenda = document.getElementById("agendaDeClientes");
  if (agenda) {
    agenda.style.display = "flex";
  }

  const editSaveBtn = document.getElementById("editSaveBtn");
  let isEditing = false;

  editSaveBtn?.addEventListener("click", async () => {
    if (!isEditing) {
      // Switch to edit mode: replace spans with inputs/selects
      // statusEnsaio
      const statusEnsaioSpan = document.getElementById("statusEnsaioSpan");
      if (statusEnsaioSpan) {
        const select = document.createElement("select");
        select.id = "statusEnsaioInput";
        ["Pendente", "Concluído", "Cancelado"].forEach(optionText => {
          const option = document.createElement("option");
          option.value = optionText;
          option.text = optionText;
          if (optionText === data.statusEnsaio) option.selected = true;
          select.appendChild(option);
        });
        statusEnsaioSpan.replaceWith(select);
      }
      // statusPagamento
      const statusPagamentoSpan = document.getElementById("statusPagamentoSpan");
      if (statusPagamentoSpan) {
        const select = document.createElement("select");
        select.id = "statusPagamentoInput";
        ["Pendente", "Pago", "Atrasado"].forEach(optionText => {
          const option = document.createElement("option");
          option.value = optionText;
          option.text = optionText;
          if (optionText === data.statusPagamento) option.selected = true;
          select.appendChild(option);
        });
        statusPagamentoSpan.replaceWith(select);
      }
      // dataPagamento
      const dataPagamentoSpan = document.getElementById("dataPagamentoSpan");
      if (dataPagamentoSpan) {
        const input = document.createElement("input");
        input.type = "date";
        input.id = "dataPagamentoInput";
        let dateValue = "";
        if (data.dataPagamento instanceof Timestamp) {
          dateValue = data.dataPagamento.toDate().toISOString().slice(0, 10);
        } else if (data.dataPagamento) {
          dateValue = new Date(data.dataPagamento).toISOString().slice(0, 10);
        }
        input.value = dateValue;
        dataPagamentoSpan.replaceWith(input);
      }
      // fotosExtras
      const fotosExtrasSpan = document.getElementById("fotosExtrasSpan");
      if (fotosExtrasSpan) {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.01";
        input.min = "0";
        input.id = "fotosExtrasInput";
        input.value = data.fotosExtras ?? "0";
        fotosExtrasSpan.replaceWith(input);
      }
      // quantidadeImpressas
      const quantidadeImpressasSpan = document.getElementById("quantidadeImpressasSpan");
      if (quantidadeImpressasSpan) {
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.id = "quantidadeImpressasInput";
        input.value = data.quantidadeImpressas ?? "0";
        quantidadeImpressasSpan.replaceWith(input);
      }
      // album
      const albumSpan = document.getElementById("albumSpan");
      if (albumSpan) {
        const select = document.createElement("select");
        select.id = "albumInput";
        ["Sim", "Não"].forEach(optionText => {
          const option = document.createElement("option");
          option.value = optionText;
          option.text = optionText;
          if (optionText === data.album) option.selected = true;
          select.appendChild(option);
        });
        albumSpan.replaceWith(select);
      }
      // quadro
      const quadroSpan = document.getElementById("quadroSpan");
      if (quadroSpan) {
        const select = document.createElement("select");
        select.id = "quadroInput";
        ["Sim", "Não"].forEach(optionText => {
          const option = document.createElement("option");
          option.value = optionText;
          option.text = optionText;
          if (optionText === data.quadro) option.selected = true;
          select.appendChild(option);
        });
        quadroSpan.replaceWith(select);
      }
      // valorAlbum
      const valorAlbumSpan = document.getElementById("valorAlbumSpan");
      if (valorAlbumSpan) {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.01";
        input.min = "0";
        input.id = "valorAlbumInput";
        input.value = valorAlbum.toFixed(2);
        valorAlbumSpan.replaceWith(input);
      }
      // valorEnsaio
      const valorEnsaioSpan = document.getElementById("valorEnsaioSpan");
      if (valorEnsaioSpan) {
        const input = document.createElement("input");
        input.type = "number";
        input.step = "0.01";
        input.min = "0";
        input.id = "valorEnsaioInput";
        input.value = valorEnsaio.toFixed(2);
        valorEnsaioSpan.replaceWith(input);
      }

      editSaveBtn.textContent = "Salvar";
      isEditing = true;
    } else {
      // Save mode: read inputs and update Firestore
      const statusEnsaioInput = document.getElementById("statusEnsaioInput") as HTMLSelectElement | null;
      const statusPagamentoInput = document.getElementById("statusPagamentoInput") as HTMLSelectElement | null;
      const dataPagamentoInput = document.getElementById("dataPagamentoInput") as HTMLInputElement | null;
      const fotosExtrasInput = document.getElementById("fotosExtrasInput") as HTMLInputElement | null;
      const quantidadeImpressasInput = document.getElementById("quantidadeImpressasInput") as HTMLInputElement | null;
      const albumInput = document.getElementById("albumInput") as HTMLSelectElement | null;
      const quadroInput = document.getElementById("quadroInput") as HTMLSelectElement | null;
      const valorAlbumInput = document.getElementById("valorAlbumInput") as HTMLInputElement | null;
      const valorEnsaioInput = document.getElementById("valorEnsaioInput") as HTMLInputElement | null;

      if (!data.id) {
        alert("ID do cliente não encontrado para atualização.");
        return;
      }

      const updatedData: any = {};

      if (statusEnsaioInput) updatedData.statusEnsaio = statusEnsaioInput.value;
      if (statusPagamentoInput) updatedData.statusPagamento = statusPagamentoInput.value;
      if (dataPagamentoInput) {
        const dateVal = dataPagamentoInput.value;
        updatedData.dataPagamento = dateVal ? Timestamp.fromDate(new Date(dateVal)) : null;
      }
      if (fotosExtrasInput) updatedData.fotosExtras = parseFloat(fotosExtrasInput.value) || 0;
      if (quantidadeImpressasInput) updatedData.quantidadeImpressas = parseInt(quantidadeImpressasInput.value) || 0;
      if (albumInput) updatedData.album = albumInput.value;
      if (quadroInput) updatedData.quadro = quadroInput.value;
      if (valorAlbumInput) updatedData.valorAlbum = parseFloat(valorAlbumInput.value) || 0;
      if (valorEnsaioInput) updatedData.valorEnsaio = parseFloat(valorEnsaioInput.value) || 0;

      // Also update valorVenda based on new values
      const newFotosExtras = updatedData.fotosExtras !== undefined ? updatedData.fotosExtras : (data.fotosExtras || 0);
      const newValorAlbum = updatedData.valorAlbum !== undefined ? updatedData.valorAlbum : (data.valorAlbum || 0);
      const newValorEnsaio = updatedData.valorEnsaio !== undefined ? updatedData.valorEnsaio : (data.valorEnsaio || 0);
      updatedData.valorVenda = newFotosExtras + newValorAlbum + newValorEnsaio;

      try {
        await updateDoc(doc(db, "clientes", data.id), updatedData);
        const docRef = doc(db, "clientes", data.id);
        const updatedSnap = await getDoc(docRef);
        if (updatedSnap.exists()) {
          const newData = { id: updatedSnap.id, ...updatedSnap.data() };
          renderCard(newData);
        }
      } catch (error) {
        console.error("Erro ao atualizar no Firestore:", error);
        alert("Erro ao salvar as alterações.");
      }
    }
  });
}

// === Render Agenda com os 10 próximos clientes ===
function renderAgendaClientes(lista: any[]) {
  const agenda = document.getElementById("agendaDeClientes");
  if (!agenda) return;
  // Removed agenda.style.display = "flex"; from here as per instructions

  // Keep the inner divs creation as per instruction
  const row1 = document.getElementById("agendaRow1");
  const row2 = document.getElementById("agendaRow2");
  if (row1) row1.innerHTML = "";
  if (row2) row2.innerHTML = "";

  lista.forEach((data, index) => {
    const ensaioDate = (data.dataEnsaio instanceof Timestamp ? data.dataEnsaio.toDate() : new Date(data.dataEnsaio)).toLocaleDateString("pt-BR");
    const card = document.createElement("div");
    card.id = "calendarCard";
    card.innerHTML = `
      <p>${data.nomeCrianca}</p>
      <span>${data.ensaios}</span>
      <span>${ensaioDate}</span>
    `;
    card.addEventListener("click", () => renderCard(data));
    const row = index < 5 ? row1 : row2;
    row?.appendChild(card);
  });
}

// === Carrega os próximos 10 clientes ===
async function loadNextTen() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojeTimestamp = Timestamp.fromDate(hoje);

  const q = query(
    collection(db, "clientes"),
    where("dataEnsaio", ">=", hojeTimestamp),
    orderBy("dataEnsaio", "asc"),
    limit(10)
  );
  const snapshot = await getDocs(q);
  const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderAgendaClientes(docs);
}

// FUNÇÕES UTILITÁRIAS
const getValue = (id: string): string => {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el?.value.trim() || "";
};

const getNumber = (id: string): number => {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? parseFloat(el.value) || 0 : 0;
};

const getDate = (id: string): Timestamp => {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? Timestamp.fromDate(new Date(el.value)) : Timestamp.now();
};

// === Envia novo cliente para o Firebase ===
const formCliente = document.getElementById("formCliente") as HTMLFormElement | null;

formCliente?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nomeCrianca = getValue("nomeCrianca");
  const nomeResponsavel = getValue("nomeResponsavel");
  const dataNascimento = getDate("dataNascimento");
  const telefone = getValue("telefone");
  const email = getValue("email");
  const dataCadastro = getDate("dataCadastro");
  const atendente = getValue("atendente");
  const fotografo = getValue("fotografo");
  const obs = getValue("obs");
  const ensaios = (document.getElementById("ensaios") as HTMLSelectElement)?.value || "";
  const dataEnsaio = getDate("dataEnsaio");
  const album = (document.getElementById("album") as HTMLSelectElement)?.value || "";
  const valorAlbum = getNumber("valorAlbum");
  const quantidadeFotos = parseInt(getValue("quantidadeFotos")) || 0;
  const fotosExtras = parseInt(getValue("quantidadeFotosExtra")) || 0;
  const valorEnsaio = getNumber("valorEnsaio");
  const valorExtras = getNumber("valorExtras");
  const quantidadeParcelas = parseInt(getValue("quantidadeParcelas")) || 0;
  const valorPagamento = getNumber("valorPagamento");
  const dataPagamento = dataCadastro;
  const valorVenda = valorAlbum + valorExtras + valorEnsaio;

  try {
    await addDoc(collection(db, "clientes"), {
      nomeCrianca,
      nomeResponsavel,
      dataNascimento,
      telefone,
      email,
      dataCadastro,
      atendente,
      obs,
      ensaios,
      dataEnsaio,
      album,
      valorAlbum,
      quantidadeFotos,
      fotosExtras,
      valorEnsaio,
      valorExtras,
      valorVenda,
      quantidadeParcelas,
      fotografo,
      valorPagamento,
      statusEnsaio: "Pendente",
      statusPagamento: "Pendente",
      dataPagamento,
      quantidadeImpressas: 0,
      quadro: "Não"
    });
    console.log("Novo cliente gravado no Firestore.");
    formCliente.reset();
    loadNextTen();
  } catch (error) {
    console.error("Erro ao salvar no Firestore:", error);
    alert("Erro ao salvar o cliente. Verifique os dados e tente novamente.");
  }
});


// === Search Filter ===
const searchInput = document.getElementById("searchValue") as HTMLInputElement;
const btnSearch = document.getElementById("btnSearch");

btnSearch?.addEventListener("click", async () => {
  const termo = searchInput.value.trim().toLowerCase();
  if (!termo) return;

  const snapshot = await getDocs(collection(db, "clientes"));
  const lista = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(doc => ((doc as any).nomeCrianca?.toLowerCase().includes(termo) || (doc as any).nomeResponsavel?.toLowerCase().includes(termo)));
  if (lista.length > 0) {
    renderCard(lista[0]);
  } else {
    alert("Cliente não encontrado.");
  }
});

// === Inicialização ===
loadNextTen();

const staticLogo = document.getElementById("logo") as HTMLElement;
const img = document.createElement("img");
img.src = "/images/logo.png";
img.alt = "Logo";
staticLogo.appendChild(img);


