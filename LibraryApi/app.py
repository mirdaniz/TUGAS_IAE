from flask import Flask, jsonify, request, render_template
from flask_mysqldb import MySQL

app = Flask(__name__)

# Konfigurasi MySQL
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'libraryapi'
app.config['MYSQL_PORT'] = 3308

mysql = MySQL(app)

@app.route('/')
def home():
    return 'Tambahkan /daftar-buku di URL untuk melihat tampilan'

@app.route('/daftar-buku')
def daftar_buku():
    return render_template('index.html')

@app.route('/buku', methods=['GET', 'POST'])
def buku():
    cursor = mysql.connection.cursor()

    if request.method == 'GET':
        cursor.execute("SELECT * FROM BUKU")
        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify(data)

    elif request.method == 'POST':
        data = request.json
        sql = "INSERT INTO BUKU (judul, pengarang, penerbit, tahun_terbit, kategori, gambar_url) VALUES (%s, %s, %s, %s, %s, %s)"
        val = (data['judul'], data['pengarang'], data['penerbit'], data['tahun_terbit'], data['kategori'], data['gambar_url'])
        cursor.execute(sql, val)
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Data berhasil ditambahkan'})

@app.route('/detailbuku')
def detailbuku():
    if 'id' in request.args:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM BUKU WHERE buku_id = %s", (request.args['id'],))
        columns = [col[0] for col in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        return jsonify(data)

@app.route('/deletebuku', methods=['DELETE'])
def deletebuku():
    if 'id' in request.args:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM BUKU WHERE buku_id = %s", (request.args['id'],))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Data berhasil dihapus'})

@app.route('/editbuku', methods=['PUT'])
def editbuku():
    if 'id' in request.args:
        data = request.get_json()
        cursor = mysql.connection.cursor()
        sql = "UPDATE BUKU SET judul=%s, pengarang=%s, penerbit=%s, tahun_terbit=%s, kategori=%s, gambar_url=%s WHERE buku_id=%s"
        val = (data['judul'], data['pengarang'], data['penerbit'], data['tahun_terbit'], data['kategori'], data['gambar_url'], request.args['id'])
        cursor.execute(sql, val)
        mysql.connection.commit()
        cursor.close()
        return jsonify({'message': 'Data berhasil diupdate'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
