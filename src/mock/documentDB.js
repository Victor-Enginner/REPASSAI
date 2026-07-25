/**
 * Document Database Manager (NoSQL JSON Storage Engine)
 * Gerenciador de Banco de Dados de Documentos de Sites
 */

const STORAGE_KEY = 'LEADSITE_DOCUMENTS_DB';

export class DocumentDatabase {
  static getDB() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveDocument(projectId, documentSchema) {
    const db = this.getDB();
    const existing = db[projectId] || { history: [] };

    const updatedDoc = {
      ...documentSchema,
      projectId,
      updatedAt: new Date().toISOString(),
      version: (existing.version || 0) + 1,
      history: [
        {
          version: (existing.version || 0) + 1,
          timestamp: new Date().toISOString(),
          schema: documentSchema
        },
        ...(existing.history || []).slice(0, 10) // Mantém últimas 10 versões
      ]
    };

    db[projectId] = updatedDoc;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return updatedDoc;
  }

  static getDocument(projectId) {
    const db = this.getDB();
    return db[projectId] || null;
  }

  static listDocuments() {
    const db = this.getDB();
    return Object.values(db);
  }
}
