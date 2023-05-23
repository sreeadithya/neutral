export function shortcut(node, { control, code, callback, code2, callback2, code3, callback3, subtext, code4, callback4, todo, shift, callback5 }) {
    const handleKeydown = event => {
        if (control && event.ctrlKey && event.code === code) {
            event.preventDefault();
            callback();
        }

        if (event.code === code3) {
            if (subtext === '') { // Check if subtext is zero
                callback3();
            }
        }
        if (event.code === code4) {
          if (todo === '') { // Check if subtext is zero
              callback4();
          }
      }
      if (shift && event.shiftKey && event.code === code2) {
        event.preventDefault();
        callback5();

    }
    else if (event.code === code2) {
        event.preventDefault();
        callback2();
    }
    };

    node.addEventListener('keydown', handleKeydown);
}
