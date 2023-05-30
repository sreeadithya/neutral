export function shortcut(node, { control, code, callback, code2, callback2, code3, callback3, subtext, code4, callback4, todo, shift, callback5, code7, callback7, code6,callback6 }) {
    const handleKeydown = event => {
        if (control && event.ctrlKey && event.code === code) {
            event.preventDefault();
            callback();
        }

        if (event.code === code3) {
                callback3();
        }
        if (event.code === code4) {

              callback4();

      }
      if (shift && event.shiftKey && event.code === code2) {
        event.preventDefault();
        callback5();

    }
    if (event.code === code2) {
        event.preventDefault();
        callback2();
    }


    if (control && event.ctrlKey && event.code === code7) {
        event.preventDefault();
        callback7();
    }

    if (control && event.ctrlKey && event.code === code6) {
        event.preventDefault();
        callback6();
    }

    };

    node.addEventListener('keydown', handleKeydown);
}

