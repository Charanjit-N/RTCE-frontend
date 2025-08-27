import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';  

const Editor = ({ socketRef, roomId, onCodeChange}) => {
  const editorRef = useRef(null);
  useEffect(() => {
    async function init(){
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById('realTimeEditor'), 
        {
          mode: { name: 'javascript', json: true },
          theme: 'material-darker',
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );


      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const codeText = instance.getValue();
        onCodeChange(codeText);
        if (origin !== 'setValue' && socketRef.current) {
            // Updated send method
            const message = JSON.stringify({
                type: ACTIONS.CODE_CHANGE,
                payload: {
                    roomId,
                    codeText,
                }
            });
            socketRef.current.send(message);
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
        // Listen for messages directly on the socket
        const handleMessage = (event) => {
            const { type, payload } = JSON.parse(event.data);
            if (type === ACTIONS.CODE_CHANGE && payload.codeText !== null) {
                editorRef.current.setValue(payload.codeText);
            }
        };

        socketRef.current.addEventListener('message', handleMessage);

        return () => {
            socketRef.current.removeEventListener('message', handleMessage);
        };
    }
  }, [socketRef.current]);

  

  return <textarea id="realTimeEditor"></textarea>;
};

export default Editor;
