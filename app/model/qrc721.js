module.exports = app => {
  const {CHAR, BLOB} = app.Sequelize

  let QRC721 = app.model.define('qrc721', {
    contractAddress: {
      type: CHAR(20).BINARY,
      primaryKey: true
    },
    name: BLOB,
    symbol: BLOB,
    totalSupply: {
      type: CHAR(32).BINARY,
      get() {
        return BigInt(`0x${this.getDataValue('totalSupply').toString('hex')}`)
      },
      set(value) {
        return this.setDataValue(
          'totalSupply',
          Buffer.from(value.toString(16).padStart(64, '0'), 'hex')
        )
      }
    }
  }, {freezeTableName: true, underscored: true, timestamps: false})

  QRC721.associate = () => {
    const {ReceiptLog, Contract} = app.model
    ReceiptLog.belongsTo(QRC721, {as: 'qrc721', foreignKey: 'address', sourceKey: 'contractAddress'})
    QRC721.hasOne(ReceiptLog, {as: 'eventLogs', foreignKey: 'address', sourceKey: 'contractAddress'})
    Contract.hasOne(QRC721, {as: 'qrc721', foreignKey: 'contractAddress'})
    QRC721.belongsTo(Contract, {as: 'contract', foreignKey: 'contractAddress'})
  }

  return QRC721
}