const dragstart_handler = (ev) => {
  // Este handler maneja o evento de o usuário começar a arrastar os blocos
  console.log("dragstart");
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.dataTransfer.dropEffect = "move";
};

const dragover_handler = (ev) => {
  // Este handler impede que, ao arrastar os blocos, mais de um seja arrastado ao mesmo tempo
  console.log("dragOver");
  ev.preventDefault();
};

const drop_handler = (ev) => {
  console.log("drag");
  ev.preventDefault();
  // Pega o id do alvo e adiciona o elemento movido para o DOM do alvo
  const data = ev.dataTransfer.getData("text/plain");
  ev.target.innerText = document.getElementById(data).innerText;

  // Uma vez derrubado, a célula é esvaziada
  ev.target.classList.remove("empty");
  ev.target.setAttribute("ondrop", "");
  ev.target.setAttribute("ondragover", "");
  document.getElementById(data).innerText = "";

  // Atualiza o estado após o drop
  state.content = getState(ul);
  // Atualiza a dimensão após o drop
  state.dimension = getDimension(state);
};

const dragend_handler = (ev) => {
  console.log("dragEnd");
  // Remove toda a data de arrastar
  ev.dataTransfer.clearData();
  // Remove todos os atributos dropáveis
  removeDroppable(document.querySelectorAll("li"));
  // Configura novos atributos de drag e drop
  setDroppable(document.querySelectorAll("li"));
  setDraggable(document.querySelectorAll("li"));
  if (isCorrect(letters, state.content)) {
    showModal();
  }
};

const showModal = () => {
    document.getElementById('message').innerText = "Você Venceu!";
    document.getElementById('modal').classList.remove("hide");
}

const hideModal = () => {
    document.getElementById('modal').classList.add("hide");
}

// Seleciona os elementos da lista
let ul = document.querySelectorAll("li");
const letters = ["A", "B", "C", "D", "E", "F", "G", "H", ""];

function setUp() {
  fillGrid(ul, letters);
  setId(ul);

  state.content = getState(ul);
  state.dimension = getDimension(state);

  // Configura ladrilhos arrastável e derrubável
  setDroppable(ul);
  setDraggable(ul);

  console.log("The state dimension", state.dimension);
}

const state = {};
state.content = letters;

/**
 * Getters
 */
const getState = (items) => {
  const content = [];
  items.forEach((item, i) => {
    content.push(item.innerText);
  });
  return content;
};

const getEmptyCell = () => {
  const emptyCellNumber = state.emptyCellIndex + 1;
  const emptyCellRow = Math.ceil(emptyCellNumber / 3);
  const emptyCellCol = 3 - (3 * emptyCellRow - emptyCellNumber);
  // emptyCellRow guarda o número da linha em que a célula vazia está;
  // o índice no array será um a menos que o número da linha. O mesmo vale para emptyCellCol
  return [emptyCellRow - 1, emptyCellCol - 1];
};

const getDimension = (state) => {
  // Loopa o conteúdo três vezes, dividindo-os num array de 3 arrays, gerando uma representação 2D dos ladrilhos
  let j = 0;
  let arr = [];
  const { content } = state;
  for (let i = 0; i < 3; i++) {
    arr.push(content.slice(j, j + 3));
    j += 3;
  }

  return arr;
};

/**
 * Setters
 */
const setDroppable = (items) => {
  items.forEach((item, i) => {
    if (!item.innerText) {
      state.emptyCellIndex = i;
      item.setAttribute("ondrop", "drop_handler(event);");
      item.setAttribute("ondragover", "dragover_handler(event);");
      item.setAttribute("class", "empty");
    }
    return;
  });
};

const removeDroppable = (items) => {
  items.forEach((item) => {
    item.setAttribute("ondrop", "");
    item.setAttribute("ondragover", "");
    item.setAttribute("draggable", "false");
    item.setAttribute("ondragstart", "");
    item.setAttribute("ondragend", "");
  });
};

const setDraggable = (items) => {
  const [row, col] = getEmptyCell();

  let left,
    right,
    top,
    bottom = null;
  // Se existirem células em cada lado da vazia, as coloca nas variáveis acima
  if (state.dimension[row][col - 1]) left = state.dimension[row][col - 1];
  if (state.dimension[row][col + 1]) right = state.dimension[row][col + 1];

  if (state.dimension[row - 1] != undefined)
    top = state.dimension[row - 1][col];
  if (state.dimension[row + 1] != undefined)
    bottom = state.dimension[row + 1][col];

  // Torna os itens arrastáveis
  items.forEach((item) => {
    if (
      item.innerText == top ||
      item.innerText == bottom ||
      item.innerText == right ||
      item.innerText == left
    ) {
      item.setAttribute("draggable", "true");
      item.setAttribute("ondragstart", "dragstart_handler(event)");
      item.setAttribute("ondragend", "dragend_handler(event)");
    }
  });
};

// Atribui um id único para cada item, na forma 'li0' - 'li8'
const setId = (items) => {
  for (let i = 0; i < items.length; i++) {
    items[i].setAttribute("id", `li${i}`);
  }
};

// Embaralhando o array
const shuffle = (arr) => {
  // Cópia do array gerada para manter sempre o estado alvo imutável
  const copy = [...arr];
  // Loopando o array
  for (let i = 0; i < copy.length; i++) {
    // Para cada índice i, escolher um índice aleatório j
    let j = parseInt(Math.random() * copy.length);
    // Trocar elementos i e j
    let temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
};

const isSolvable = (arr) => {
  let number_of_inv = 0;
  // Pega o número de inversões
  for (let i = 0; i < arr.length; i++) {
    // i pega o primeiro elemento
    for (let j = i + 1; j < arr.length; j++) {
      // checa que existe um elemento exista nos índices i e j, então checa que o elemento no i > o no j
      if (arr[i] && arr[j] && arr[i] > arr[j]) number_of_inv++;
    }
  }
  // Se o número de inversões for par, o quebra-cabeça é solucionável
  return number_of_inv % 2 == 0;
};

const isCorrect = (solution, content) => {
  // Retorna true se o estado atual for igual ao inicial não embaralhado
  if (JSON.stringify(solution) == JSON.stringify(content)) return true;
  return false;
};

const fillGrid = (items, letters) => {
  let shuffled = shuffle(letters);
  // Embaralha o array de letras até haver uma configuração solucionável
  while (!isSolvable(shuffled)) {
    shuffled = shuffle(letters);
  }

  items.forEach((item, i) => {
    item.innerText = shuffled[i];
  });
};
fillGrid(ul, letters);
