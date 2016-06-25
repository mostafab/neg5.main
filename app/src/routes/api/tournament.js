export default (app) => {
    
    app.get('/api/t/:tid', (req, res) => {
        res.json({name: 'Test Tournament'});
    })
    
}