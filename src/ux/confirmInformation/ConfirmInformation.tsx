import React, { useState } from 'react'
import { SD } from '../../lib/sdr'
import { Header2, SmallSpan, typeShared } from '../../ui/shared/Typography'
import { Button } from '../../ui/shared/Button'
import { credentialValueToText } from '../../vc-json-schema-adapter'
import { Trans } from 'react-i18next'
import { getChainName } from '../../adapters'
import { IProviderUserOptions } from 'web3modal'
import Checkbox from '../../ui/shared/Checkbox'
import { getPeerInfo } from './getPeerLogo'
import ConfirmInWallet from '../../ui/shared/ConfirmInWallet'
import styled from 'styled-components'

import { LIST_TITLE, LIST_DESCRIPTION } from '../../constants/cssSelectors'
import { DONT_SHOW_AGAIN_KEY } from '../../constants'

interface ConfirmInformationProps {
  chainId: number | undefined
  address: string | undefined
  displayMode: boolean
  sd: SD | undefined
  providerUserOption: IProviderUserOptions
  provider: any
  onConfirm: () => Promise<any>
  onCancel: () => void
}

export function ConfirmInformation ({ displayMode, chainId, address, providerUserOption, sd, provider, onConfirm, onCancel }: ConfirmInformationProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dontShowAgainSelected, setDontShowAgainSelected] = useState<boolean>(false)
  const data = sd ? Object.assign({}, sd.credentials, sd.claims) : {}

  const handleSubmit = async () => {
    setIsLoading(true)

    await onConfirm()

    setIsLoading(false)
  }

  const peerWallet = getPeerInfo(provider?.wc?.peerMeta)

  const isHardwareWallet = provider?.isLedger || provider?.isTrezor || provider?.isDCent

  return !isLoading
    ? <>
      <Header2><Trans>Information</Trans></Header2>
      <CenterContent>
        {providerUserOption && (
          <LogoWrapper>
            <img src={providerUserOption.logo} alt={providerUserOption.name} />
          </LogoWrapper>
        )}
        {peerWallet && <LogoWrapper>
          <img src={peerWallet.logo} alt={peerWallet.name} />
        </LogoWrapper>}
      </CenterContent>

      <List>
        <Column>
          <Title><Trans>Wallet address</Trans>:</Title>
          {peerWallet && <Title><Trans>Connected wallet</Trans>:</Title>}
          <Title><Trans>Network</Trans>:</Title>
          {isHardwareWallet && <Title><Trans>Derivation path</Trans>:</Title>}
          {sd && Object.keys(sd.claims).map(key => <Title key={`claim-key-${key}`}>{key}:</Title>)}
          {sd && Object.keys(sd.credentials).map(key => <Title key={`credential-key-${key}`}>{key}:</Title>)}
        </Column>
        <Column>
          <Description>{shortAddress(address)}</Description>
          {peerWallet && <Description>{peerWallet.name}</Description>}
          <Description>{chainId && getChainName(chainId)}</Description>
          {isHardwareWallet && <Description>{provider.dpath || provider.path}</Description>}
          {sd && Object.keys(sd.claims).map(key => <Description key={`claim-value-${key}`}>{data[key]}</Description>)}
          {sd && Object.keys(sd.credentials).map(key => <Description key={`credential-value-${key}`}>{credentialValueToText(key, data[key])}</Description>)}
        </Column>
      </List>
      {!displayMode && (
        <>
          <CenterContent>
            <Button variant="secondary" onClick={onCancel} disabled={isLoading} className="cancel"><Trans>Cancel</Trans></Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="confirm"><Trans>Confirm</Trans></Button>
          </CenterContent>
          <CenterContent>
            <label style={{ marginTop: 20 }}>
              <Checkbox checked={dontShowAgainSelected} onChange={() => setDontShowAgainSelected(prev => {
                localStorage.setItem(DONT_SHOW_AGAIN_KEY, JSON.stringify(!prev))
                return !prev
              })} />
              <SmallSpan><Trans>Do not show again</Trans></SmallSpan>
            </label>
          </CenterContent>
        </>
      )}
    </>
    : <ConfirmInWallet providerName={providerUserOption ? providerUserOption.name : ''} />
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const List = styled.dl`
  display: flex;
  padding: 50px 0;
  justify-content: center;
  gap: 30px;
`

const TitleWrapper = styled.dt`
  ${typeShared}
  font-weight: 500 !important;
  font-size: 16px;
  color: ${props => props.theme.p};
  margin: 6px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
  text-align: left;
`
const Title: React.FC<{ className?: string; }> = ({ children, className }) => (
  <TitleWrapper className={className ? `${LIST_TITLE} ${className}` : LIST_TITLE}>
    {children}
  </TitleWrapper>
)

const DescriptionWrapper = styled.dd`
  ${typeShared}
  font-weight: 400 !important;
  font-size: 16px;
  color: ${props => props.theme.secondaryText};
  margin: 6px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
  text-align: left;
`
const Description: React.FC<{ className?: string; }> = ({ children, className }) => (
  <DescriptionWrapper className={className ? `${LIST_DESCRIPTION} ${className}` : LIST_DESCRIPTION}>
    {children}
  </DescriptionWrapper>
)

const CenterContent = styled.div`
  display: flex; 
  gap: 16px;
  justify-content: center;
`

const LogoWrapper = styled.div`
  margin-top: 30px;
  width: 85px;
  height: 85px;
  display: flex;
  justify-content: center;
  align-items: center;
  & img {
    border-radius: 10px;
    width: 100%;
    height: 100%;
  }
`

export function shortAddress (address?: string): string {
  if (!address) return ''

  return `${address.substr(0, 6)}...${address.substr(
    address.length - 4,
    address.length
  )}`
}
