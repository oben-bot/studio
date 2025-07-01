
'use client';

import { useWorkflow } from '@/hooks/use-workflow';
import { MainHeader } from '@/components/app/main-header';
import { SetupWizard } from '@/components/app/setup-wizard';
import { ChatAssistant } from '@/components/app/chat-assistant';
import { VectorizationSettings } from '@/components/app/vectorization-settings';
import { Workspace } from '@/components/app/workspace';

export default function Home() {
  const workflow = useWorkflow();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <MainHeader 
        handleDownload={workflow.handleDownload}
        resetWorkflow={workflow.resetWorkflow}
        svgResult={workflow.svgResult}
        isProcessing={workflow.isProcessing}
        mode={workflow.mode}
      />

      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-full">
          
          <aside className="space-y-6 flex flex-col">
            {workflow.mode === 'setup' ? (
              <SetupWizard
                workType={workflow.workType}
                setWorkType={workflow.setWorkType}
                corteSubType={workflow.corteSubType}
                setCorteSubType={workflow.setCorteSubType}
                threeDSubType={workflow.threeDSubType}
                setThreeDSubType={workflow.setThreeDSubType}
                fontType={workflow.fontType}
                setFontType={workflow.setFontType}
                textInput={workflow.textInput}
                setTextInput={workflow.setTextInput}
                selectedFile={workflow.selectedFile}
                setSelectedFile={workflow.setSelectedFile}
                isProcessing={workflow.isProcessing}
                handleSetupGenerate={workflow.handleSetupGenerate}
                isSetupComplete={workflow.isSetupComplete}
                fileInputRef={workflow.fileInputRef}
              />
            ) : (
              <ChatAssistant
                chatMessages={workflow.chatMessages}
                chatInput={workflow.chatInput}
                setChatInput={workflow.setChatInput}
                handleChatSubmit={workflow.handleChatSubmit}
                isProcessing={workflow.isProcessing}
              />
            )}

            <VectorizationSettings 
              detailLevel={workflow.detailLevel}
              setDetailLevel={workflow.setDetailLevel}
              smoothness={workflow.smoothness}
              setSmoothness={workflow.setSmoothness}
              removeBackground={workflow.removeBackground}
              setRemoveBackground={workflow.setRemoveBackground}
              singlePath={workflow.singlePath}
              setSinglePath={workflow.setSinglePath}
            />
          </aside>

          <Workspace 
            isProcessing={workflow.isProcessing}
            svgResult={workflow.svgResult}
          />

        </div>
      </main>
    </div>
  );
}
