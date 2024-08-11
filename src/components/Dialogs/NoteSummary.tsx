import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function NoteSummary({ text, isDialogOpen, onClose }) {
  const [wordCount, setWordCount] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [paragraphCount, setParagraphCount] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [averageReadingTime, setAverageReadingTime] = useState(0);
  const [shinePosition, setShinePosition] = useState({ x: '0%', y: '0%' });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const numWords = words.length;
    setWordCount(numWords);

    const characterCount = text.length;
    setLetterCount(characterCount);

    setLineCount(text.split(/\r\n|\r|\n/).length);
    setParagraphCount(text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length);

    const calculateAverageReadingTime = (wordCount) => {
      // Avg. reading speed is 200wpm
      const wordsPerMinute = 200;
      return Math.ceil(wordCount / wordsPerMinute);
    };

    setAverageReadingTime(calculateAverageReadingTime(numWords));

    // The regex assumes that periods after a sentence are followed by a space
    // so that it does not include decimal points/URLs as a sentence.
    const sentenceDelimiterRegex = /[.!?]+\s/;
    const sentences = text.split(sentenceDelimiterRegex).filter(sentence => sentence.trim().length > 0);
    const numSentences = sentences.length;
    setSentenceCount(numSentences);
  }, [text]);

  const summaryItems = [
    { label: 'Letters', value: letterCount, description: 'The total number of letters in the note, also including empty spaces.' },
    { label: 'Words', value: wordCount, description: 'The total number of words in the note, separated by at least one space.' },
    { label: 'Lines', value: lineCount, description: 'The total number of lines in the note, including empty lines.' },
    { label: 'Paragraphs', value: paragraphCount, description: 'The total number of paragraphs in the note, separated by at least one blank line.' },
    { label: 'Sentences', value: sentenceCount, description: 'The total number of sentences in the note, separated by sentence-ending punctuation.' },
    { label: 'Time to Read', value: `${averageReadingTime} minutes`, description: 'The estimated time it takes to read the note at an average speed of 200 words per minute.' },
  ];

  const handleShowToast = (label, description) => {
    toast(
      <div className="toast-container">
        <strong className="toast-title">{label}</strong>
        <p className="toast-message">{description}</p>
      </div>,
      {
        duration: 2000,
        position: 'bottom-center',
        closeButton: false,
        unstyled: true,
      }
    );
  };

  const handleMouseMove = (e) => {
    // Calculate the cursor position as a percentage,
    // relative to the element's width and height.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setShinePosition({ x: `${x}%`, y: `${y}%` });
  };

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 px-6 md:px-0 selection:text-zinc-300 selection:bg-neutral-700">
          <Dialog.Content asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
              className="bg-dark border border-neutral-800 p-6 rounded-lg shadow-2xl shadow-neutral-950 max-w-lg w-full relative"
            >
              <Dialog.Title className="text-lg font-medium text-zinc-100 pb-1">
                Note Summary
              </Dialog.Title>
              <Dialog.Description className="text-stone-500 text-sm leading-normal mb-4">
                This is a summary of various metrics about your note. Click on these metrics for more information about how they are calculated.
              </Dialog.Description>
              <div className="grid grid-cols-2 gap-4">
                {summaryItems.map(({ label, value, description }, index) => (
                  <div
                    key={label}
                    className="summary-item bg-neutral-900 bg-opacity-60 hover:bg-neutral-800 hover:bg-opacity-40 border border-neutral-800 p-3 rounded-md cursor-pointer transition-colors duration-300"
                    onClick={() => handleShowToast(label, description)}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    aria-label={label}
                  >
                    <div
                      className="shine"
                      style={{
                        '--shine-x': hoveredIndex === index ? shinePosition.x : '0%',
                        '--shine-y': hoveredIndex === index ? shinePosition.y : '0%',
                      } as React.CSSProperties} // Bypasses TS error, don't remove (fml)
                    ></div>
                    <div className="summary-item-content">
                      <div className="text-sm font-medium text-zinc-300">
                        {label}
                      </div>
                      <div className="text-lg md:tracking-normal tracking-tighter text-teal-400 truncate">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Dialog.Close className="absolute top-4 right-2 text-sm text-zinc-300 hover:text-zinc-400 font-semibold duration-300 px-1 py-0.5 mr-1" aria-label="Close">
                <X size={20} />
              </Dialog.Close>
            </motion.div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}