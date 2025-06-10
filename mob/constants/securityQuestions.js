export const SECURITY_QUESTIONS = [
  "Kako se zvao tvoj prvi ljubimac?",
  "U kojem gradu si rođen/rođena?",
  "Kako se zove ulica u kojoj si odrastao/odrasla?",
  "Kako se zvao tvoj najbolji prijatelj iz djetinjstva?",
  "Koja ti je omiljena boja?",
  "Kako se zove tvoja omiljena knjiga?",
  "U kojoj školi si završio/završila osnovnu školu?",
  "Kako se zove tvoj omiljeni film?",
  "Koje ti je omiljeno jelo?",
  "Kako se zvao tvoj prvi učitelj ili učiteljica?"
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