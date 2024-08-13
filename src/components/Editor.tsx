import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast, Toaster } from 'sonner';
import Command from './Command';
import NoteSummary from './Dialogs/NoteSummary';
import Download from './Dialogs/Download';
import ConfirmNew from './Dialogs/ConfirmNew';
import copy from 'copy-to-clipboard';
import hotkeys from 'hotkeys-js';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { useText } from './Markdown/TextContent';
import { saveAs } from 'file-saver';
import { isIOS } from 'react-device-detect';

export default function Editor() {
  const router = useRouter();
  const { text, setText } = useText();
  const textareaRef = useRef(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('.txt');
  const [isNoteSummaryDialogOpen, setNoteSummaryDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  useEffect(() => {
    const savedText = localStorage.getItem('text');
    if (savedText) {
      setText(savedText);
      toast.info('Restored the contents of the previous note.');
    }
  }, [setText]);

  useEffect(() => {
    localStorage.setItem('text', text);
  }, [text]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Set the height to the scrollHeight to expand with content
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && /\.(txt|md)$/i.test(file.name)) {
      readFileContents(file);
    } else {
      toast.error('File not supported!', {
        description: `Please select a '.txt' or '.md' file.`
      });
    }
  };

  const readFileContents = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      const fileNameWithExtension = file.name;
      const fileName = fileNameWithExtension.replace(/\.[^/.]+$/, '');
      const fileExtension = fileNameWithExtension.split('.').pop();

      setText(fileContent);
      setFileName(fileName);
      setFileType(`.${fileExtension}`);
      toast.success('Successfully imported contents!');
    };
    reader.readAsText(file);
  };

  const handleDownload = (fileName, fileType) => {
    if (!text.trim()) {
      toast.warning('Cannot download an empty note!', {
        description: 'Please type something and then save your note.',
      });
      return;
    }

    const validFileTypes = ['.txt', '.md'];
    const extension = validFileTypes.includes(fileType) ? fileType : '.txt';
    const sanitizedText = DOMPurify.sanitize(text);
    const blob = new Blob([sanitizedText], { type: 'text/plain' });

    const defaultFileName = 'note';
    const sanitizedFileName = sanitizeFileName(fileName || defaultFileName);

    let finalFileName = sanitizedFileName;
    if (!finalFileName.toLowerCase().endsWith(extension.toLowerCase())) {
      finalFileName += extension;
    }

    saveAs(blob, finalFileName);

    if (isIOS) {
      toast.info('Check your downloads folder.', {
        description: `Make sure you clicked 'Download' on the alert that appeared to download the note to your device. If you didn't, the note did not download.`,
        duration: 5000,
      });
    } else {
      setTimeout(() => {
        toast.success('Saved to your device!', {
          description: `Check your recent files to find the note! Re-open it here at any time by pressing Ctrl+O or the 'Open Note' option in the command menu and selecting the correct file.`,
        });
      }, 400);
    }

    setModalVisible(false);
  };

  const sanitizeFileName = (fileName) => {
    return fileName.replace(/[<>:"\/\\|?*]/g, '-');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      const fileName = file.name;
      const extension = fileName.split('.').pop();

      if (extension && (extension.toLowerCase() === 'txt' || extension.toLowerCase() === 'md')) {
        readFileContents(file);
      } else {
        toast.error('File not supported!', {
          description: `Please drag in a '.txt' or '.md' file.`
        });
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target || !event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleCopy = async () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      if (textarea.value.trim() === '') {
        toast.warning('There is no content to copy!');
        return;
      }
      try {
        copy(textarea.value);
        toast.success('Note copied to your clipboard!');
      } catch (error) {
        toast.error('Failed to copy note to your clipboard.');
      }
    }
  };

  const handleCommandSelect = (commandId: string) => {
    switch (commandId) {
      case 'new':
        setConfirmationDialogOpen(true);
        break;
      case 'open':
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        fileInput.click();
        break;
      case 'save':
        setModalVisible(true);
        break;
      case 'copy':
        handleCopy();
        break;
      case 'preview':
        toast.promise(
          router.push(`/preview`),
          {
            loading: 'Loading Markdown preview...',
            success: 'Markdown preview loaded successfully!',
            error: 'Failed to load Markdown preview.',
            closeButton: false,
          }
        );
        break;
      case 'summary':
        setNoteSummaryDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const handleNewNoteConfirm = () => {
    setText('');
    toast.info('Started a brand new note.');
    setConfirmationDialogOpen(false);
  };

  const handleNewNoteCancel = () => {
    setConfirmationDialogOpen(false);
  };

  useEffect(() => {
    const hotkeyList = 'ctrl+n, ctrl+o, ctrl+s, ctrl+c, ctrl+m, ctrl+i, command+n, command+o, command+s, command+c, command+m, command+i';

    const handler = (event: KeyboardEvent, handler: any) => {
      event.preventDefault();
      switch (handler.key) {
        case 'ctrl+n':
        case 'command+n':
          handleCommandSelect('new');
          break;
        case 'ctrl+o':
        case 'command+o':
          handleCommandSelect('open');
          break;
        case 'ctrl+s':
        case 'command+s':
          handleCommandSelect('save');
          break;
        case 'ctrl+c':
        case 'command+c':
          handleCommandSelect('copy');
          break;
        case 'ctrl+m':
        case 'command+m':
          handleCommandSelect('preview');
          break;
        case 'ctrl+i':
        case 'command+i':
          handleCommandSelect('summary');
        default:
          break;
      }
    };

    hotkeys(hotkeyList, handler);

    return () => {
      hotkeys.unbind(hotkeyList);
    };
  }, []);

  return (
    <div
      className={`overflow-x-hidden bg-[#111111] min-h-screen flex flex-col justify-center items-center antialiased scroll-smooth p-4 md:p-8 relative`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black transition-opacity duration-300 z-50 pointer-events-none ${isDraggingOver ? 'opacity-50' : 'opacity-0'}`}
      />
      <div className="max-w-2xl w-full space-y-3 flex-col relative z-10 mb-10">
        <div className="relative">
          <div className="-ml-3 px-1">
            <Command openCommandMenu={handleCommandSelect} />
            <input
              type="file"
              id="fileInput"
              style={{ display: 'none' }}
              accept=".txt,.md"
              onChange={handleFileInputChange}
            />
          </div>
          <motion.textarea
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            value={text}
            placeholder="Start typing here..."
            onChange={(e) => setText(e.target.value)}
            className="bg-transparent text-neutral-200 placeholder:text-neutral-600 outline-none w-full p-4 duration-300 text-lg rounded-md min-h-96 h-[550px] max-w-screen overflow-auto caret-amber-400 tracking-tight md:tracking-normal resize-none mt-3"
            aria-label="Note Content"
          />
        </div>
      </div>
      <Toaster richColors closeButton pauseWhenPageIsHidden theme="dark" />
      {isNoteSummaryDialogOpen && (
        <NoteSummary
          text={text}
          isDialogOpen={isNoteSummaryDialogOpen}
          onClose={() => setNoteSummaryDialogOpen(false)}
        />
      )}
      {isModalVisible && (
        <Download
          isOpen={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
          onDownload={handleDownload}
          fileName={fileName}
          setFileName={setFileName}
          fileType={fileType}
          setFileType={setFileType}
        />
      )}
      <ConfirmNew
        isOpen={isConfirmationDialogOpen}
        onConfirm={handleNewNoteConfirm}
        onCancel={handleNewNoteCancel}
      />
    </div>
  );
}
