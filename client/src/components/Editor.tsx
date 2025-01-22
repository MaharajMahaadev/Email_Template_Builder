import React, { useState, useEffect } from 'react';
import { Upload, AlignLeft, AlignCenter, AlignRight, MoveUp, MoveDown, Save, Plus, Type, Image, MousePointer, Minus, Download, History, X, AArrowDown, AArrowUp, CircleEllipsisIcon } from 'lucide-react';
import type { EmailTemplate, Section } from '../types';
import { serverCalls } from '../api/api';

export default function Editor() {
  const [ showHis, setShowHis] = useState(false);
  const [ templateHis, setTemplateHis ] = useState<EmailTemplate[]>([]);
  const [template, setTemplate] = useState<EmailTemplate>({
    title: 'Welcome Email',
    content: 'Welcome to our platform!',
    sections: [
      {
        id: '1',
        type: 'text',
        content: 'Hello there!',
        order: 0,
        styles: {
          fontSize: '16px',
          color: '#273746',
          textAlign: 'left',
          padding: '1rem'
        }
      }
    ]
  });

  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [ loadingDown, setLoadingDown] = useState(false);
  const [showElementsMenu, setShowElementsMenu] = useState(false);

  useEffect(() => {
    const loadLayout = async () => {
      try {
        await serverCalls.getLayoutTemplate();
        console.log('Layout template loaded successfully');
      } catch (error) {
        console.error('Error loading layout template:', error);
      }
    };
    loadLayout();

    const fetchHistory = async () => {
      try{
      const res = await fetch('http://localhost:5000/data');
      const data = await res.json();
        console.log(data);
        setTemplateHis(data.data);
      }
      catch(err){
        console.log(err);
      }
    };

    fetchHistory();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTemplate(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = (type: Section['type']) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? 'New text section' : 
               type === 'button' ? 'Click me' : 
               type === 'divider' ? '' : 'Image description',
      order: template.sections.length,
      styles: {
        fontSize: '16px',
        color: '#000000',
        textAlign: 'left',
        padding: '1rem',
        backgroundColor: type === 'button' ? '#f4f6f5' : undefined,
        borderRadius: type === 'button' ? '0.375rem' : undefined
      }
    };
    setTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setShowElementsMenu(false);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...template.sections];
    if (direction === 'up' && index > 0) {
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    }
    setTemplate(prev => ({ ...prev, sections: newSections }));
  };

  const deleteSection = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    setActiveSection(null);
  };

  const handleSave = async () => {
    setLoadingSave(true);
    try {
      const result = await serverCalls.saveTemplate(template);
      console.log('Template saved with ID:', result.id);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDownload = async () => {
    setLoadingDown(true);
    try {
      const html = await serverCalls.generateHtml(template);
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.title.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating HTML:', error);
      alert('Error generating HTML');
    } finally {
      setLoadingDown(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#e5e8e8]">
      <History className='absolute top-2 left-2' onClick={() => setShowHis(true)} />
      { showHis && <div className='absolute bg-sky-200 z-10 left-0 top-0 w-[250px]'>
        <div className='p-2 w-full justify-between flex flex-row'>
        <p>History</p>
        <X onClick={() => setShowHis(false)} />
        </div>
        <div>
          {
            templateHis.map((state,index) => 
              <div onClick={() => setTemplate(state)} key={index} className='p-2 bg-rose-200 w-full h-fit border-y-2 border-x-black overflow-x-hidden'>
                <p className='font-bold h-12 overflow-y-hidden'>{state.title}</p>
                <p className='font-semibold h-24 overflow-y-hidden'>{state.content}</p>
              </div>
            )
          }
        </div>
      </div>}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Logo Upload Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden mb-4">
            {template.logoUrl ? (
              <img src={template.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <label className="cursor-pointer flex flex-col items-center">
                <Upload className="w-6 h-6 text-[#273746]" />
                <span className="text-xs text-[#273746] mt-1">Add Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          {template.logoUrl && (
            <label className="cursor-pointer text-sm text-[#273746] hover:underline">
              Change Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Email Builder */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Title and Description */}
          <div className="p-6 border-b border-gray-200">
            <input
              type="text"
              value={template.title}
              onChange={(e) => setTemplate(prev => ({ ...prev, title: e.target.value }))}
              className="w-full text-2xl font-bold text-[#273746] border-none focus:ring-0 focus:outline-none mb-4"
              placeholder="Enter Template Title"
            />
            <textarea
              value={template.content}
              onChange={(e) => setTemplate(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-2 border border-gray-200 rounded focus:ring-2 focus:ring-[#273746] focus:border-transparent"
              placeholder="Enter template description..."
              rows={3}
            />
          </div>

          {/* Sections */}
          <div className="relative">
            {template.sections.map((section, index) => (
              <div 
                key={section.id}
                className={`relative transition-all duration-200 ${
                  activeSection === index ? 'ring-2 ring-[#273746]' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveSection(index)}
              >
                <CircleEllipsisIcon />
                {/* Section Content */}
                <div className="p-4">
                  {section.type === 'text' && (
                    <textarea
                      value={section.content}
                      onChange={(e) => {
                        const newSections = [...template.sections];
                        newSections[index].content = e.target.value;
                        setTemplate(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="w-full p-2 border-0 focus:ring-0 bg-transparent resize-none"
                      style={section.styles}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {section.type === 'button' && (
                    <button
                      className="px-4 py-2 rounded"
                      style={section.styles}
                    >
                      {section.content}
                    </button>
                  )}
                  {section.type === 'divider' && (
                    <hr className="my-4 border-gray-200" />
                  )}
                </div>

                {/* Section Controls - Only visible when active */}
                {activeSection === index && (
                  <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white shadow-md rounded-md p-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, 'up');
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      disabled={index === 0}
                    >
                      <MoveUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, 'down');
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      disabled={index === template.sections.length - 1}
                    >
                      <MoveDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(index);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    {(section.type === 'text' || 'button') && (
                      <>
                        <div className="w-px h-4 bg-gray-200 mx-1" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSections = [...template.sections];
                            newSections[index].styles = {
                              ...newSections[index].styles,
                              textAlign: 'left'
                            };
                            setTemplate(prev => ({ ...prev, sections: newSections }));
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <AlignLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSections = [...template.sections];
                            newSections[index].styles = {
                              ...newSections[index].styles,
                              textAlign: 'center'
                            };
                            setTemplate(prev => ({ ...prev, sections: newSections }));
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <AlignCenter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSections = [...template.sections];
                            newSections[index].styles = {
                              ...newSections[index].styles,
                              textAlign: 'right'
                            };
                            setTemplate(prev => ({ ...prev, sections: newSections }));
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <AlignRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newSections = [...template.sections];
                            const currentSize = parseInt(newSections[index].styles?.fontSize || "16px", 10); // Default to 16px if undefined
                            const newSize = `${currentSize + 2}px`; 
                            newSections[index].styles = {
                              ...newSections[index].styles,
                              fontSize: newSize
                            };
                            setTemplate((prev) => ({ ...prev, sections: newSections }));
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <AArrowUp className="w-4 h-4" /> 
                        </button>
                        <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newSections = [...template.sections];

                                const currentSize = parseInt(newSections[index].styles?.fontSize || "16px", 10); 
                                const newSize = `${currentSize - 2}px`; 
                                newSections[index].styles = {
                                  ...newSections[index].styles,
                                  fontSize: newSize
                                };
                                setTemplate((prev) => ({ ...prev, sections: newSections }));
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <AArrowDown className="w-4 h-4" />
                            </button>
                            <input
                              type="color"
                              value={template.sections[index].styles?.color || "#000000"}
                              onChange={(e) => {
                                const newColor = e.target.value;

                                const newSections = [...template.sections];

                                newSections[index].styles = {
                                  ...newSections[index].styles,
                                  color: newColor,
                                };
                                setTemplate((prev) => ({ ...prev, sections: newSections }));
                              }}
                              className="p-1 rounded border border-gray-300"
                            />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add Section Button */}
            <div className="p-4 relative">
              <button
                onClick={() => setShowElementsMenu(!showElementsMenu)}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-[#273746] hover:text-[#273746] transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </button>

              {/* Elements Menu */}
              {showElementsMenu && (
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addSection('text')}
                      className="flex items-center p-2 hover:bg-gray-50 rounded"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      Text Block
                    </button>
                    <button
                      onClick={() => addSection('button')}
                      className="flex items-center p-2 hover:bg-gray-50 rounded"
                    >
                      <MousePointer className="w-4 h-4 mr-2" />
                      Button
                    </button>
                    <button
                      onClick={() => addSection('image')}
                      className="flex items-center p-2 hover:bg-gray-50 rounded"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Image
                    </button>
                    <button
                      onClick={() => addSection('divider')}
                      className="flex items-center p-2 hover:bg-gray-50 rounded"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Divider
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4 justify-end">
          <button
            onClick={handleSave}
            disabled={loadingSave}
            className="bg-[#273746] text-white px-6 py-2 rounded flex items-center hover:bg-opacity-90 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loadingSave ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={handleDownload}
            disabled={loadingDown}
            className="bg-[#273746] text-white px-6 py-2 rounded flex items-center hover:bg-opacity-90 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            {loadingDown ? 'Generating...' : 'Download HTML'}
          </button>
        </div>
      </div>
    </div>
  );
}