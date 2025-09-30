import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../input'
import { describe, it, expect, vi } from 'vitest'

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-10', 'w-full')
  })

  it('handles value changes', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Hello World')

    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('Hello World')
  })

  it('can be disabled', () => {
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards refs correctly', () => {
    const ref = vi.fn()
    render(<Input ref={ref} />)

    expect(ref).toHaveBeenCalled()
  })

  it('supports placeholder text', () => {
    render(<Input placeholder="Enter your name" />)

    const input = screen.getByPlaceholderText('Enter your name')
    expect(input).toBeInTheDocument()
  })

  it('handles focus and blur events', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()

    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')

    await user.click(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    await user.tab() // Move focus away
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('supports default value', () => {
    render(<Input defaultValue="Default text" />)

    const input = screen.getByDisplayValue('Default text')
    expect(input).toBeInTheDocument()
  })

  it('supports controlled value', () => {
    const handleChange = vi.fn()
    const { rerender } = render(<Input value="initial" onChange={handleChange} />)

    expect(screen.getByDisplayValue('initial')).toBeInTheDocument()

    rerender(<Input value="updated" onChange={handleChange} />)
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Input
        aria-label="Username"
        aria-describedby="username-help"
        aria-required
      />
    )

    const input = screen.getByRole('textbox', { name: /username/i })
    expect(input).toHaveAttribute('aria-describedby', 'username-help')
    expect(input).toHaveAttribute('aria-required', 'true')
  })

  it('handles keyboard events', async () => {
    const user = userEvent.setup()
    const handleKeyDown = vi.fn()

    render(<Input onKeyDown={handleKeyDown} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '{Enter}')

    expect(handleKeyDown).toHaveBeenCalled()
  })

  it('supports readonly state', () => {
    render(<Input readOnly value="Read only text" />)

    const input = screen.getByDisplayValue('Read only text')
    expect(input).toHaveAttribute('readonly')
  })

  it('handles maxLength attribute', async () => {
    const user = userEvent.setup()
    render(<Input maxLength={5} />)

    const input = screen.getByRole('textbox')
    await user.type(input, '1234567890')

    expect(input).toHaveValue('12345')
  })
})