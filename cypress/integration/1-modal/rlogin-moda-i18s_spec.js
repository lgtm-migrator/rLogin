import currentProvider from '@rsksmart/mock-web3-provider'

describe('rLoign modal interaction', () => {
  beforeEach(() => {
    const address = '0xB98bD7C7f656290071E52D1aA617D9cB4467Fd6D'
    const privateKey = 'de926db3012af759b4f24b5a51ef6afa397f04670f634aa4f48d4480417007f3'
    cy.on('window:before:load', (win) => {
      win.ethereum = currentProvider({
        address,
        privateKey,
        chainId: 31,
        debug: true,
        manualConfirmEnable: true
      })
    })

    cy.visit('/')
    cy.contains('login with rLogin').click()
  })

  it('test loaders', () => {
    cy.contains('MetaMask').click()
    cy.get('.loading').should('exist')
    cy.window().then((win) => {
      win.ethereum.answerEnable(true)
      cy.get('.loading').should('not.exist')

    })
  })

  it('selects spanish', () => {
    cy.get('select').select('es')
    cy.contains('Conecte su wallet')
  })

  it('selects english', () => {
    cy.get('select').select('en')
    cy.contains('Connect your wallet')
  })
  it('selects spanish, closes modal and remembers selection', () => {
    cy.get('select').select('es')
    cy.contains('Conecte su wallet')

    cy.get('.rlogin-modal-close-button').click()
    cy.get('.rlogin-modal-lightbox').should('be.not.visible')
    cy.contains('login with rLogin').click()
    cy.contains('Conecte su wallet')

    cy.get('select#languages option:selected').should('have.text', 'Spanish')
  })
})
