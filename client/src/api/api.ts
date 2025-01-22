let savedTemplates: any[] = [];

export const serverCalls = {
  async getLayoutTemplate(): Promise<string> {
    const response = await fetch('https://email-template-builder-5hyq.onrender.com/layout');
    return response.text();
  },

  async saveTemplate(template: any): Promise<{ id: string }> {
    await fetch('https://email-template-builder-5hyq.onrender.com/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(template),
    });
    const id = Date.now().toString();
    savedTemplates.push({ ...template, id });
    return { id };
  },

  async generateHtml(template: any): Promise<string> {
    const res = await fetch('https://email-template-builder-5hyq.onrender.com/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(template)
    });

    const data = await res.text();
    return data;
  }

};


