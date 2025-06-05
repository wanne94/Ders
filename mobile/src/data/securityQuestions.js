export const SECURITY_QUESTIONS = [
  "Kako se zvalo vaše prvo kućno životinje?",
  "U kojem gradu ste rođeni?",
  "Kako se zove vaša osnovna škola?",
  "Koje je vaše omiljeno jelo?",
  "Kako se zvao vaš prvi učitelj/učiteljica?",
  "Koja je vaša omiljena boja?",
  "U kojoj ulici ste odrasli?",
  "Kako se zove vaš najbolji prijatelj iz djetinjstva?",
  "Koja je vaša omiljena knjiga?",
  "Koje je ime vašeg djeda/bake?"
];

// Funkcija za dobijanje random pitanja
export const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * SECURITY_QUESTIONS.length);
  return {
    index: randomIndex,
    question: SECURITY_QUESTIONS[randomIndex]
  };
};

// Funkcija za dobijanje pitanja po indeksu
export const getQuestionByIndex = (index) => {
  if (index >= 0 && index < SECURITY_QUESTIONS.length) {
    return SECURITY_QUESTIONS[index];
  }
  return null;
}; 