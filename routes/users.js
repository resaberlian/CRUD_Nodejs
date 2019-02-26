const express = require('express')
const app = express()
const ObjectId = require('mongodb').ObjectId

//Tampilkan Data    
app.get('/tampil' , function(req,res, next){
    //mengambil data dari database secara decending
    req.db.collection('coba').find().sort({"_id": -1}).toArray(function(err,result){

        if (err) {
            req.flash('error', err)
            res.render('user/list', {
                tittle: 'Daftar Buku',
                data: ''
            })
        } else {
            // menampilkan views list.ejs
            res.render('user/list', {
                tittle: 'Daftar Buku',
                data: result 
            })
        }

    })
})
//tampilkan form input 
app.get('/add', function(req,res,next){
    //tampilkan views addd.ejs
    res.render('user/add', {
        tittle: 'TAMBAH DATA',
        judul_buku: '',
        tahun: '',
        harga: '',
        penerbit : '',
        penulis: '',
        stok: '',
        foto_cover: ''
    })
})

// Proses input data
app.post('/add', function(req,res, next){
    req.assert('judul_buku', 'judul_buku is required').notEmpty() //form validation
    req.assert('tahun', 'tahun is required').notEmpty()
    req.assert('harga','harga is required').notEmpty()
    req.assert('penerbit','penerbit is required').notEmpty()
    req.assert('penulis','penulis is required').notEmpty()
    req.assert('stok','stok is required').isNumeric()

    var errors = req.validationErrors()

    if(!errors){
        var user = {
            judul_buku : req.sanitize('judul_buku').escape().trim(),
            tahun : req.sanitize('tahun').escape().trim(),
            harga: req.sanitize('harga').escape().trim(),
            penerbit: req.sanitize('penerbit').escape().trim(),
            penulis : req.sanitize('penulis').escape().trim(),
            stok : req.sanitize('stok').escape().trim()
            

        }

        req.db.collection('coba').insert(user, function(err, result){
            if (err){
                req.flash('error',err)

                // render to views/user/add.ejs
                res.render('user/add', {
                    tittle: 'TAMBAH DATA' ,
                    judul_buku: user.judul_buku,
                    tahun: user.tahun,
                    harga:user.harga,
                    penerbit: user.penerbit,
                    penulis: user.penulis,
                    stok: user.stok
                
                })
            } else {
                req.flash('Berhasil', 'Data berhasil ditambah!')

                //redirect to user list page 
                res.redirect('/tampil')
            }
        })
    }
    else{ //Display errors to user
            var error_msg =''
            errors.forEach(function(error){
                error_msg += error.msg + '<br>'
            })    
            req.flash('error', error_msg)

            res.render('user/add' , {
                tittle: 'TAMBAH DATA' ,
                judul_buku: user.judul_buku,
                tahun: user.tahun,
                harga:user.harga,
                penerbit: user.penerbit,
                penulis: user.penulis,
                stok: user.stok
             
            })
        }
})

//SHOW EDIT USER FORM
app.get('/edit/(:id)', function(req,res, next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').find({"_id": o_id}).toArray(function(err,result){
        if(err) return console.log(err)

        //jika data tidak ada 
        if (!result){
            req.flash('error', 'User not found with id = ' + req.params.id)
            res.redirect('/users')
        }
        else { //jika data ada 
            //tampilkan views/user/edit.ejs
            res.render('user/edit', {
                tittle: 'EDIT DATA',
                id: result[0]._id,
                judul_buku: result[0].judul_buku,
                tahun: result[0].tahun,
                harga: result[0].harga,
                penerbit: result[0].penerbit, 
                penulis: result[0].penulis,
                stok: result[0].stok
            })
        }
    })
})

//EDIT USER POST ACTION 
app.put('/edit/(:id)', function(req,res,next){
    req.assert('judul_buku', 'judul_buku is required').notEmpty() //form validation
    req.assert('tahun', 'tahun is required').notEmpty()
    req.assert('harga','harga is required').notEmpty()
    req.assert('penerbit','penerbit is required').notEmpty()
    req.assert('penulis','penulis is required').notEmpty()
    req.assert('stok','stok is required').isNumeric()
    req.assert('foto_cover','foto is required').notEmpty()
    var errors = req.validationErrors()

    if(!errors){ //jika form validation benar

        var user = {
            judul_buku : req.sanitize('judul_buku').escape().trim(),
            tahun : req.sanitize('tahun').escape().trim(),
            harga: req.sanitize('harga').escape().trim(),
            penerbit: req.sanitize('penerbit').escape().trim(),
            penulis : req.sanitize('penulis').escape().trim(),
            stok : req.sanitize('stok').escape().trim()
        }

        var o_id = new ObjectId(req.params.id)
        req.db.collection('coba').update({"_id": o_id}, user, function(err, result){
            if (err){
                req.flash('error',err)
                // render to views/user/edit.ejs
                res.render('user/edit',{
                    tittle: 'EDIT DATA',
                    id: req.params.id,
                    judul_buku: user.judul_buku,
                    tahun: user.tahun,
                    harga:user.harga,
                    penerbit: user.penerbit,
                    penulis: user.penulis,
                    stok: user.stok
                })
            } else {
                req.flash('Berhasil','Data berhasil diupdate')
                req.redirect('/tampil')
            }
        })
    }
    else { //Display errors to user 
        var error_msg = ''
        errors.forEach(function(error){
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)

        res.render('user/edit', {
            tittle: 'EDIT DATA' ,
            id: req.params.id,
            judul_buku: user.judul_buku,
            tahun: user.tahun,
            harga:user.harga,
            penerbit: user.penerbit,
            penulis: user.penulis,
            stok: user.stok
        })

    }
})


//DELETE USER
app.delete('/delete/:id',function(req,res , next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').remove({"_id": o_id}, function(err,result){
        if (err){
            req.flash('error',err)
            //redirect Hlaman tampil data 
            res.redirect('/users')
        }else {
            req.flash('berhasil','Data berhasil dihapus')
            // redirect Halaman tampil data
            res.redirect('/tampil')
        }
    })
})
      
//GET DETAIL
app.get('/detail/(:id)' , function(req,res, next){
    //mengambil data dari database secara decending
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').find({"_id": o_id}).toArray(function(err,result){
        if(err) return console.log(err)
        //jika data tidak ada 
        if (!result){
            req.flash('error', 'User not found with id = ' + req.params.id)
            res.redirect('/users')
        }
        else { //jika data ada 
            //tampilkan views/user/edit.ejs
            res.render('user/detail', {
                tittle: 'Detail',
                id: result[0]._id,
                judul_buku: result[0].judul_buku,
                tahun: result[0].tahun,
                harga: result[0].harga,
                penerbit: result[0].penerbit, 
                penulis: result[0].penulis,
                stok: result[0].stok
            })
        }
    })
})
module.exports = app
