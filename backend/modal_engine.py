import os
try:
    import modal
except ImportError:
    modal = None

if modal:
    # Define a aplicação Modal
    app = modal.App("repass-osint-engine")

    # Mount dos arquivos locais necessários para o Scraper rodar remotamente
    mounts = [
        modal.Mount.from_local_file(
            local_path="scraper_monster.py",
            remote_path="/root/scraper_monster.py"
        )
    ]

    # Define a imagem do container Debian Slim com as dependências essenciais
    image = modal.Image.debian_slim().pip_install(
        "requests",
        "beautifulsoup4",
        "urllib3",
    )

    @app.function(image=image, mounts=mounts, timeout=300, concurrency_limit=100)
    def executar_varredura_modal(estado: str, cidade: str, bairro: str, nichos: str, max_results: int):
        """
        Função Serverless que roda na nuvem elástica da Modal.
        Importa o scraper localmente DENTRO do container e executa o código.
        """
        # Importação feita dentro da função para ser carregada apenas no ambiente remoto
        import sys
        sys.path.append("/root")
        from scraper_monster import OSINTCore
        
        print(f"[Modal Cloud] Iniciando Sandbox Seguro para '{cidade}, {estado}' (Nichos: {nichos})")
        
        # A chave de API do Google precisa estar setada no dashboard da Modal
        engine = OSINTCore()
        resultados = engine.executar_varredura(
            estado=estado, 
            cidade=cidade, 
            bairro=bairro, 
            nichos=nichos, 
            max_results=max_results
        )
        
        print(f"[Modal Cloud] Varredura Finalizada. {len(resultados)} leads extraídos via infraestrutura elástica.")
        
        return resultados
else:
    print("[REPASS] Modal package não encontrado. Rodando em modo Local Restrito.")
