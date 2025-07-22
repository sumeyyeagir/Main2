import fitz  # PyMuPDF

pdf_path = r"C:\Users\ervae\Downloads\Proje-main\src\pages\Enabiz-Tahlilleri.pdf"  # Kendi dosya yolun

doc = fitz.open(pdf_path)

full_text = ""
for page in doc:
    full_text += page.get_text() + "\n"
doc.close()

print(full_text)
print("*" * 50)

satirlar = full_text.split("\n")

plt_index = None
for i, satir in enumerate(satirlar):
    if "PLT" in satir:
        plt_index = i
        break

if plt_index is not None:
    sonraki_satirlar = satirlar[plt_index + 1 : plt_index + 2]
    sonuc = "\n".join(sonraki_satirlar)
    print("PLT Sonucu:", sonuc)
else:
    print("PLT bulunamadı.")

isim_index = None
for i, satir in enumerate(satirlar):
    if "Adı" in satir:
        isim_index = i
        break

if isim_index is not None:
    isim_satiri = satirlar[isim_index]
    isim_parcasi = isim_satiri.split()
    if len(isim_parcasi) >= 4:
        t = isim_parcasi[2]
        soyisim = isim_parcasi[3]
        print("İsim:", t)
        print("Soyisim:", soyisim)
else:
    print("İsim bulunamadı.")
