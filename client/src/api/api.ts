let savedTemplates: any[] = [];

export const serverCalls = {
  async getLayoutTemplate(): Promise<string> {
    const response = await fetch('http://localhost:5000/layout');
    return response.text();
  },

  async saveTemplate(template: any): Promise<{ id: string }> {
    await fetch('http://localhost:5000/upload', {
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
    const res = await fetch('http://localhost:5000/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(template)
    });

    const data = await res.text();
    return data;
  }

};


