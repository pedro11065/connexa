-- Tabela para armazenar informações dos usuários
CREATE TABLE usuarios (
   id UUID PRIMARY KEY,
   nome TEXT NOT NULL,
   email TEXT NOT NULL UNIQUE,
   senha_hash TEXT NOT NULL,
   curso TEXT,
   periodo INTEGER, -- Representa o número do período
   status TEXT CHECK (status IN ('pendente', 'ativo', 'bloqueado')) DEFAULT 'pendente',
   criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar grupos de estudo
CREATE TABLE grupos_estudo (
   id UUID PRIMARY KEY,
   usuario_criador_id UUID NOT NULL,
   materia TEXT NOT NULL,
   objetivo TEXT,
   local TEXT CHECK (local IN ('online', 'presencial')) NOT NULL,
   limite_participantes INTEGER NOT NULL CHECK (limite_participantes > 0),
   status TEXT CHECK (status IN ('ativo', 'encerrado')) DEFAULT 'ativo',
   criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   data_encerramento TIMESTAMP,
   FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela para armazenar participantes dos grupos
CREATE TABLE participantes (
   id UUID PRIMARY KEY,
   grupo_id UUID NULL,
   usuario_id UUID NOT NULL,
   data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   UNIQUE (grupo_id, usuario_id),
   FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE CASCADE,
   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela para armazenar mensagens dos grupos
CREATE TABLE mensagens (
   id UUID PRIMARY KEY,
   grupo_id UUID NOT NULL,
   usuario_id UUID NOT NULL,
   conteudo TEXT NOT NULL,
   data_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (grupo_id) REFERENCES grupos_estudo(id) ON DELETE CASCADE,
   FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para otimizar consultas
CREATE INDEX idx_participantes_grupo ON participantes(grupo_id);
CREATE INDEX idx_mensagens_grupo_data ON mensagens(grupo_id, data_envio);