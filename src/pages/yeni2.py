import fitz  # PyMuPDF

def extract_patient_info_from_pdf_path(pdf_path):
    """
    PDF dosyasını açar, platelet (PLT), isim ve soyismi çıkarır.
    """
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()

    satirlar = full_text.split("\n")

    # PLT satırını bul
    plt_index = None
    for i, satir in enumerate(satirlar):
        if "PLT" in satir:
            plt_index = i
            break

    sonuc = ""
    if plt_index is not None:
        sonraki_satirlar = satirlar[plt_index + 1 : plt_index + 2]
        sonuc = "\n".join(sonraki_satirlar)

    # İsim soyisim satırını bul
    isim_index = None
    for i, satir in enumerate(satirlar):
        if "Adı" in satir:
            isim_index = i
            break

    t = ""
    soyisim = ""
    if isim_index is not None:
        isim_satiri = satirlar[isim_index]
        isim_parcasi = isim_satiri.split()
        if len(isim_parcasi) >= 4:
            t = isim_parcasi[2]
            soyisim = isim_parcasi[3]

    return sonuc, t, soyisim


def extract_patient_info_from_pdf_file(pdf_file):
    """
    pdf_file: Flask'tan gelen dosya objesi (file stream)
    """
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()

    satirlar = full_text.split("\n")

    plt_index = None
    for i, satir in enumerate(satirlar):
        if "PLT" in satir:
            plt_index = i
            break

    sonuc = ""
    if plt_index is not None:
        sonraki_satirlar = satirlar[plt_index + 1 : plt_index + 2]
        sonuc = "\n".join(sonraki_satirlar)

    isim_index = None
    for i, satir in enumerate(satirlar):
        if "Adı" in satir:
            isim_index = i
            break

    t = ""
    soyisim = ""
    if isim_index is not None:
        isim_satiri = satirlar[isim_index]
        isim_parcasi = isim_satiri.split()
        if len(isim_parcasi) >= 4:
            t = isim_parcasi[2]
            soyisim = isim_parcasi[3]

    return sonuc, t, soyisim
