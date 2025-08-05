function(properties, context) {
  const script = properties.script;
  const isAsync = properties.async;
  const debug = properties.debug;

  const helpers = {
    log: (...args) => console.log('[JSAction]', ...args),
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    now: () => new Date().toISOString()
  };

  const execute = async () => {
    try {
      if (debug) {
        console.log('[PluginJS] Executing script:\n', script);
      }

      // Script exécuté dans une fonction async anonyme
      const fn = new Function('properties', 'context', 'helpers', `
        return (async () => {
          "use strict";
          ${script}
        })();
      `);

      const result = await fn(properties, context, helpers);

      if (debug) {
        console.log('[JSAction] Result:', result);
      }

      if (typeof context.send === 'function') {
        context.send(result);
      }

    } catch (err) {
      console.error('[JSAction] Error:', err);

      if (typeof context.fail === 'function') {
        context.fail(err.toString());
      }
    }
  };

  if (isAsync) {
    setTimeout(execute, 0);
  } else {
    execute();
  }
}