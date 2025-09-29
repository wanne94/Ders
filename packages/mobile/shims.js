// Shim za es-abstract caseFolding problem sa Hermes
// Jednostavniji pristup bez Node.js module sistema

if (typeof global !== 'undefined' && !global.__shimApplied) {
  global.__shimApplied = true;
  
  // Override console.error da filtrira specifične greške
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorMessage = args[0]?.toString() || '';
    
    // Ignoriši es-abstract greške
    if (errorMessage.includes("Cannot read property 'S' of undefined") ||
        errorMessage.includes("Cannot read property 'default' of undefined")) {
      // Samo loguj upozorenje umjesto greške
      console.warn('Ignored es-abstract compatibility error');
      return;
    }
    
    // Proslijedi sve ostale greške
    originalConsoleError.apply(console, args);
  };
}