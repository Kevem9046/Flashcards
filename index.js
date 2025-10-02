// Banco de dados inicial de flashcards
let flashcards = JSON.parse(localStorage.getItem('flashcards')) || [
    {
        question: "Qual é a capital do Brasil?",
        options: ["Rio de Janeiro", "Brasília", "São Paulo", "Salvador"],
        correctAnswers: [1],
        explanation: "Brasília foi planejada e desenvolvida para ser a capital do Brasil, sendo inaugurada em 21 de abril de 1960.",
        type: "single"
    },
    {
        question: "Quais são planetas do sistema solar?",
        options: ["Mercúrio", "Vênus", "Terra", "Marte", "Júpiter", "Saturno", "Urano", "Netuno"],
        correctAnswers: [0, 1, 2, 3, 4, 5, 6, 7],
        explanation: "O sistema solar possui 8 planetas: Mercúrio, Vênus, Terra, Marte, Júpiter, Saturno, Urano e Netuno.",
        type: "multiple"
    }
];

// Variáveis de estado
let currentCardIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let selectedOptions = [];

// Elementos do DOM
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const resultElement = document.getElementById('result');
const explanationElement = document.getElementById('explanation');
const nextButton = document.getElementById('next-btn');
const prevButton = document.getElementById('prev-btn');
const resetButton = document.getElementById('reset-btn');
const addButton = document.getElementById('add-btn');
const exportButton = document.getElementById('export-btn');
const importButton = document.getElementById('import-btn');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');
const totalCountElement = document.getElementById('total-count');
const currentCardElement = document.getElementById('current-card');
const totalCardsElement = document.getElementById('total-cards');

// Elementos do modal
const modal = document.getElementById('add-modal');
const closeModal = document.querySelector('.close');
const addFlashcardForm = document.getElementById('add-flashcard-form');
const questionTypeSelect = document.getElementById('question-type');
const importFileInput = document.getElementById('import-file');

// Salvar flashcards no localStorage
function saveFlashcards() {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
}

// Carregar estatísticas salvas
function loadStats() {
    const savedStats = localStorage.getItem('flashcardStats');
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        correctAnswers = stats.correctAnswers || 0;
        incorrectAnswers = stats.incorrectAnswers || 0;
    }
}

// Inicializar a aplicação
function initializeApp() {
    loadStats();
    updateStats();
    showFlashcard(currentCardIndex);
    
    // Event listeners
    nextButton.addEventListener('click', nextFlashcard);
    prevButton.addEventListener('click', prevFlashcard);
    resetButton.addEventListener('click', resetStats);
    addButton.addEventListener('click', openModal);
    exportButton.addEventListener('click', exportFlashcards);
    importButton.addEventListener('click', () => importFileInput.click());
    closeModal.addEventListener('click', closeModalHandler);
    addFlashcardForm.addEventListener('submit', handleAddFlashcard);
    questionTypeSelect.addEventListener('change', handleQuestionTypeChange);
    importFileInput.addEventListener('change', importFlashcards);
    
    // Fechar modal clicando fora dele
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModalHandler();
        }
    });
}

// Mostrar flashcard atual
function showFlashcard(index) {
    selectedOptions = [];
    
    if (flashcards.length === 0) {
        questionElement.textContent = "Nenhum flashcard disponível. Adicione um novo!";
        optionsElement.innerHTML = '';
        feedbackElement.style.display = 'none';
        return;
    }
    
    // Garantir que o índice esteja dentro dos limites
    if (index >= flashcards.length) {
        currentCardIndex = 0;
        index = 0;
    }
    
    const card = flashcards[index];
    
    // Atualizar pergunta
    questionElement.textContent = card.question;
    
    // Atualizar opções
    optionsElement.innerHTML = '';
    card.options.forEach((option, i) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        if (card.type === 'multiple') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.index = i;
            optionElement.appendChild(checkbox);
        }
        
        const optionText = document.createElement('span');
        optionText.textContent = option;
        optionElement.appendChild(optionText);
        
        optionElement.dataset.index = i;
        optionElement.addEventListener('click', handleOptionClick);
        optionsElement.appendChild(optionElement);
    });
    
    // Esconder feedback
    feedbackElement.style.display = 'none';
    
    // Atualizar progresso
    currentCardElement.textContent = index + 1;
    totalCardsElement.textContent = flashcards.length;
    
    // Controlar visibilidade dos botões
    prevButton.disabled = index === 0;
    nextButton.disabled = index === flashcards.length - 1;
}

// Lidar com clique em opção
function handleOptionClick(event) {
    const selectedOption = event.currentTarget;
    const selectedIndex = parseInt(selectedOption.dataset.index);
    const currentCard = flashcards[currentCardIndex];
    
    if (currentCard.type === 'single') {
        // Desabilitar todas as opções
        document.querySelectorAll('.option').forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Verificar resposta
        if (selectedIndex === currentCard.correctAnswers[0]) {
            selectedOption.classList.add('correct');
            resultElement.textContent = "✅ Correto!";
            resultElement.style.color = "#48bb78";
            correctAnswers++;
        } else {
            selectedOption.classList.add('incorrect');
            // Destacar resposta correta
            document.querySelectorAll('.option')[currentCard.correctAnswers[0]].classList.add('correct');
            resultElement.textContent = "❌ Incorreto!";
            resultElement.style.color = "#f56565";
            incorrectAnswers++;
        }
        
        // Mostrar explicação
        explanationElement.textContent = currentCard.explanation;
        
        // Mostrar feedback
        feedbackElement.style.display = 'block';
        
    } else if (currentCard.type === 'multiple') {
        const checkbox = selectedOption.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        
        if (checkbox.checked) {
            selectedOption.classList.add('selected');
            if (!selectedOptions.includes(selectedIndex)) {
                selectedOptions.push(selectedIndex);
            }
        } else {
            selectedOption.classList.remove('selected');
            selectedOptions = selectedOptions.filter(idx => idx !== selectedIndex);
        }
        
        // Habilitar o botão de verificar quando pelo menos uma opção for selecionada
        if (selectedOptions.length > 0) {
            // Criar botão de verificar se não existir
            if (!document.getElementById('check-btn')) {
                const checkButton = document.createElement('button');
                checkButton.id = 'check-btn';
                checkButton.className = 'next-btn';
                checkButton.textContent = 'Verificar Resposta';
                checkButton.addEventListener('click', checkMultipleChoice);
                optionsElement.parentNode.insertBefore(checkButton, feedbackElement);
            }
        }
    }
    
    // Atualizar estatísticas
    updateStats();
}

// Verificar resposta de múltipla escolha
function checkMultipleChoice() {
    const currentCard = flashcards[currentCardIndex];
    
    // Desabilitar todas as opções
    document.querySelectorAll('.option').forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // Verificar resposta
    const isCorrect = selectedOptions.length === currentCard.correctAnswers.length &&
                     selectedOptions.every(opt => currentCard.correctAnswers.includes(opt)) &&
                     currentCard.correctAnswers.every(opt => selectedOptions.includes(opt));
    
    if (isCorrect) {
        resultElement.textContent = "✅ Correto!";
        resultElement.style.color = "#48bb78";
        correctAnswers++;
        
        // Destacar todas as corretas
        currentCard.correctAnswers.forEach(idx => {
            document.querySelectorAll('.option')[idx].classList.add('correct');
        });
    } else {
        resultElement.textContent = "❌ Incorreto!";
        resultElement.style.color = "#f56565";
        incorrectAnswers++;
        
        // Destacar corretas e incorretas
        currentCard.correctAnswers.forEach(idx => {
            document.querySelectorAll('.option')[idx].classList.add('correct');
        });
        selectedOptions.forEach(idx => {
            if (!currentCard.correctAnswers.includes(idx)) {
                document.querySelectorAll('.option')[idx].classList.add('incorrect');
            }
        });
    }
    
    // Mostrar explicação
    explanationElement.textContent = currentCard.explanation;
    
    // Mostrar feedback
    feedbackElement.style.display = 'block';
    
    // Remover botão de verificar
    const checkButton = document.getElementById('check-btn');
    if (checkButton) {
        checkButton.remove();
    }
    
    // Atualizar estatísticas
    updateStats();
}

// Próximo flashcard
function nextFlashcard() {
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++;
    } else {
        // Voltar para o primeiro se estiver no último
        currentCardIndex = 0;
    }
    showFlashcard(currentCardIndex);
}

// Flashcard anterior
function prevFlashcard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
    } else {
        // Ir para o último se estiver no primeiro
        currentCardIndex = flashcards.length - 1;
    }
    showFlashcard(currentCardIndex);
}

// Reiniciar estatísticas
function resetStats() {
    correctAnswers = 0;
    incorrectAnswers = 0;
    currentCardIndex = 0;
    updateStats();
    showFlashcard(currentCardIndex);
}

// Atualizar estatísticas
function updateStats() {
    correctCountElement.textContent = correctAnswers;
    incorrectCountElement.textContent = incorrectAnswers;
    totalCountElement.textContent = correctAnswers + incorrectAnswers;
    
    // Salvar estatísticas no localStorage
    localStorage.setItem('flashcardStats', JSON.stringify({
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers
    }));
}

// Abrir modal
function openModal() {
    modal.style.display = 'block';
    // Resetar checkboxes
    document.querySelectorAll('.correct-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Fechar modal
function closeModalHandler() {
    modal.style.display = 'none';
    addFlashcardForm.reset();
}

// Mudar tipo de questão
function handleQuestionTypeChange() {
    const type = questionTypeSelect.value;
    const checkboxes = document.querySelectorAll('.correct-checkbox');
    
    if (type === 'single') {
        checkboxes.forEach(checkbox => {
            checkbox.type = 'radio';
            checkbox.name = 'correct-option';
        });
    } else {
        checkboxes.forEach(checkbox => {
            checkbox.type = 'checkbox';
            checkbox.name = '';
        });
    }
}

// Adicionar novo flashcard
function handleAddFlashcard(event) {
    event.preventDefault();
    
    const question = document.getElementById('new-question').value;
    const optionInputs = document.querySelectorAll('.option-input');
    const correctCheckboxes = document.querySelectorAll('.correct-checkbox:checked');
    const explanation = document.getElementById('new-explanation').value;
    const type = questionTypeSelect.value;
    
    const options = Array.from(optionInputs).map(input => input.value);
    const correctAnswers = Array.from(correctCheckboxes).map(cb => parseInt(cb.dataset.index));
    
    // Validar entrada
    if (correctAnswers.length === 0) {
        alert('Por favor, selecione pelo menos uma opção correta');
        return;
    }
    
    if (type === 'single' && correctAnswers.length > 1) {
        alert('Para questões de única escolha, selecione apenas uma opção correta');
        return;
    }
    
    // Validar se todas as opções estão preenchidas
    if (options.some(option => option.trim() === '')) {
        alert('Por favor, preencha todas as opções');
        return;
    }
    
    // Adicionar novo flashcard
    const newFlashcard = {
        question,
        options,
        correctAnswers,
        explanation,
        type
    };
    
    flashcards.push(newFlashcard);
    
    // Salvar no localStorage
    saveFlashcards();
    
    // Fechar modal e resetar formulário
    closeModalHandler();
    
    // Atualizar interface
    showFlashcard(currentCardIndex);
    
    alert('Flashcard adicionado com sucesso!');
}

// Exportar flashcards
function exportFlashcards() {
    const dataStr = JSON.stringify(flashcards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'meus-flashcards.json';
    link.click();
    
    URL.revokeObjectURL(url);
}

// Importar flashcards
function importFlashcards(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedFlashcards = JSON.parse(e.target.result);
            if (Array.isArray(importedFlashcards)) {
                flashcards = importedFlashcards;
                saveFlashcards();
                currentCardIndex = 0;
                showFlashcard(currentCardIndex);
                alert('Flashcards importados com sucesso!');
            } else {
                alert('Arquivo inválido. Por favor, selecione um arquivo JSON válido.');
            }
        } catch (error) {
            alert('Erro ao importar flashcards. Verifique se o arquivo é válido.');
        }
    };
    reader.readAsText(file);
    
    // Resetar input file
    event.target.value = '';
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initializeApp);