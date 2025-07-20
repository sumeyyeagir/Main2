import fitz  # PyMuPDF

# PDF dosyasını aç
doc = fitz.open(r"C:\Users\ervae\Downloads\Proje-main\src\pages\Enabiz-Tahlilleri.pdf")  # ← PDF dosyanın adı

# Tüm içerik biriktirilecek
full_text = ""

# Her sayfayı gez ve metni ekle
for page in doc:
    full_text += page.get_text() + "\n"

# PDF kapat (iyi bir alışkanlık)
doc.close()

# Tüm içeriği yazdır
print(full_text)
print('*'*50)

metin = full_text

# Metni satırlara böl
satirlar = metin.split("\n")

# PLT'nin olduğu satırın index'ini bul
plt_index = None
for i, satir in enumerate(satirlar):
    if "PLT" in satir:
        plt_index = i
        break

if plt_index is not None:
    # PLT'den sonraki satırları al
    sonraki_satirlar = satirlar[plt_index+1 : plt_index + 2]
    # İstersen hepsini birleştir
    sonuc = "\n".join(sonraki_satirlar)
    print(sonuc)

for i, satir in enumerate(satirlar):
    if "Adı" in satir:
        plt_index = i
        break

if plt_index is not None:
    # PLT'den sonraki satırları al
    sonraki_satirlar = satirlar[plt_index : plt_index +1]
    isim = "\n".join(sonraki_satirlar)
    print(isim)
    isim = isim.split()
    t=isim[2]
    print(isim[2])

    soyisim = isim[3]
    print(soyisim)

else:
    print("PLT bulunamadı.")


