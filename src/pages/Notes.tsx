export function Notes() {
  return (
    <div className="max-w-4xl mx-auto text-center py-20 px-4">
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Smart Notes AI</h1>
      <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
        Use our dedicated Smart Notes app to boost your learning. Perfect for summarizing complex topics, generating quizzes, and creating flashcards.
      </p>
      <a 
        href="https://smart-notes-ai-ecru.vercel.app/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
      >
        Go to Smart Notes AI
      </a>
    </div>
  );
}
